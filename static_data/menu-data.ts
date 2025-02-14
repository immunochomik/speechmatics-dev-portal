import {
  MenuPadlockIcon,
  MenuBillingIcon,
  MenuLearnIcon,
  MenuHouseIcon,
  MenuGettingStartedIcon,
  MenuTrackUsageIcon,
  TranscribeIcon,
  ViewJobsIcon,
  MicrophoneIcon
} from '../components/icons-library';

const menuData = [
  {
    path: '/home/',
    title: 'Home',
    icon: MenuHouseIcon
  },
  {
    path: '/real-time-demo/',
    title: 'Real-Time Demo',
    icon: MicrophoneIcon
  },
  {
    path: '/transcribe/',
    title: 'Upload & Transcribe',
    icon: TranscribeIcon
  },
  {
    path: '/getting-started/',
    title: 'Start Using API',
    icon: MenuGettingStartedIcon
  },
  {
    path: '/manage-access/',
    title: 'Manage Access',
    icon: MenuPadlockIcon
  },
  {
    path: '/view-jobs/',
    title: 'View Jobs',
    icon: ViewJobsIcon
  },
  {
    path: '/usage/',
    title: 'Track Usage',
    icon: MenuTrackUsageIcon
  },
  {
    path: '/manage-billing/',
    title: 'Manage Billing',
    icon: MenuBillingIcon
  },
  {
    path: '/learn/',
    title: 'Learn',
    icon: MenuLearnIcon
  }
];

export default menuData;
