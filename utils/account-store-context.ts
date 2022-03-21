import { createContext } from 'react';
import { makeObservable, observable, computed, action, makeAutoObservable } from 'mobx';
import { callGetAccounts, callPostAccounts, callRemoveApiKey, errToast } from './call-api';
import { AuthenticationResult } from '@azure/msal-common';

class AccountContext {
  _account: Account = null;

  isLoading: boolean = false;

  constructor() {
    makeObservable(this, {
      clear: action,
      _account: observable,
      assignServerState: action,
      isLoading: observable,
    });
  }

  set account(account: Account) {
    this._account = account;
  }

  get account(): Account {
    return this._account;
  }

  clear() {
    this.account = null;
  }

  getApiKeys(): ApiKey[] {
    return this._account?.contracts
      .filter((con) => !!con)?.[0]
      ?.projects.filter((proj) => !!proj)?.[0]?.api_keys;
  }

  getProjectId(): number {
    return this._account?.contracts
      .filter((con) => !!con)?.[0]
      ?.projects.filter((proj) => !!proj)?.[0].project_id;
  }

  getContractId(): number {
    return this._account?.contracts.filter((con) => !!con)?.[0]?.contract_id;
  }

  getRuntimeURL(): string {
    return this._account?.contracts.filter((con) => !!con)?.[0]?.runtime_url;
  }

  getPaymentMethod(): PaymentMethod | null {
    return this._account?.contracts.filter((con) => !!con)?.[0]?.payment_method;
  }

  getUsageLimit(type: 'standard' | 'enhanced'): number | undefined {
    const dict = {
      standard: 'LIM_DUR_CUR_MON_STANDARD_SEC',
      enhanced: 'LIM_DUR_CUR_MON_ENHANCED_SEC',
    };

    return (
      (this._account?.contracts
        .filter((con) => !!con)?.[0]
        ?.usage_limits?.find((el) => el.name == dict[type])?.value || 0) / 3600
    );
  }

  async fetchServerState(idToken: string) {
    this.isLoading = true;
    return callGetAccounts(idToken)
      .then((jsonResp) => {
        if (checkIfAccountResponseLegit(jsonResp)) {
          this.assignServerState(jsonResp);
          this.isLoading = false;
        } else {
          throw new Error(`callGetAccounts response malformed: ${jsonResp}`);
        }
      })
      .catch((err) => {
        console.error('fetchServerState', err);
        this.isLoading = false;
      });
  }

  assignServerState(response: GetAccountsResponse) {
    if (!response) throw new Error('attempt assigning empty response');

    this._account = response.accounts?.filter((acc) => !!acc)?.[0];

    console.log('assignServerState', this._account);
  }

  async accountsFetchFlow(
    accessToken: string,
    isSettingUpAccount: (val: boolean) => void
  ): Promise<any> {
    this.isLoading = true;
    return callGetAccounts(accessToken)
      .then(async (jsonResp: any) => {
        if (
          jsonResp &&
          jsonResp.accounts &&
          Array.isArray(jsonResp.accounts) &&
          jsonResp.accounts.length == 0
        ) {
          console.log(
            'no account on management platform, sending a request to create with POST /accounts'
          );
          isSettingUpAccount(true);
          return callPostAccounts(accessToken).then((jsonPostResp) => {
            isSettingUpAccount(false);
            this.isLoading = false;
            return jsonPostResp;
          });
        } else if (jsonResp && Array.isArray(jsonResp.accounts) && jsonResp.accounts.length > 0) {
          this.isLoading = false;
          return jsonResp;
        }

        throw new Error(`unknown response from /accounts: ${jsonResp}`);
      })
      .catch((err) => {
        errToast(`unknown error while fetching account: ${err}`);
        this.isLoading = false;
        console.error(err);
      });
  }
}

class TokenContext {
  tokenPayload: AuthenticationResult = null;

  constructor() {
    makeObservable(this, {
      tokenPayload: observable,
      setTokenPayload: action,
    });
  }

  setTokenPayload(tokenPayload: AuthenticationResult) {
    this.tokenPayload = tokenPayload;
  }
}

export function checkIfAccountResponseLegit(jsonResp: any) {
  return (
    jsonResp &&
    'accounts' in jsonResp &&
    Array.isArray(jsonResp.accounts) &&
    jsonResp.accounts.length > 0
  );
}

export const accountStore = new AccountContext();
export const tokenStore = new TokenContext();

export default createContext({ accountStore, tokenStore });

interface GetAccountsResponse {
  accounts: Account[];
}

interface Account {
  account_id: number;
  contracts: Contract[];
}

interface Contract {
  contract_id: number;
  usage_limits: UsageLimit[];
  projects: Project[];
  runtime_url: string;
  payment_method: PaymentMethod | null;
}

interface UsageLimit {
  name: string;
  value: number;
}

interface Project {
  project_id: number;
  name: string;
  api_keys: ApiKey[];
}

export interface ApiKey {
  apikey_id: string;
  name: string;
  created_at: string;
  client_ref: string;
}

export interface PaymentMethod {
  card_type: string;
  masked_card_number: string;
  expiration_month: number;
  expiration_year: number;
}
