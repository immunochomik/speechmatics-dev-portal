import { Box, Button, Divider, Flex, Text } from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { DescriptionLabel, HeaderLabel, PageHeader, SmPanel } from "../components/common";
import Dashboard from "../components/dashboard";
import { CompleteIcon, FileProcessingFailedIcon, FileProcessingIcon } from "../components/icons-library";
import { FileUploadComponent, SelectField, FileProcessingProgress, TranscriptionViewer } from "../components/transcribe-form";
import accountStoreContext from "../utils/account-store-context";
import { languagesData, separation, accuracyModels } from "../utils/transcribe-elements";
import { fileTranscriptionFlow as flow, FileTranscriptionStore } from "../utils/transcribe-store-flow";



export default observer(function Transcribe({ }) {

  const { stage } = flow.store;

  const { tokenStore } = useContext(accountStoreContext);

  useEffect(() => {
    flow.reset();
    if (tokenStore.tokenPayload?.idToken)
      flow.fetchSecret(tokenStore.tokenPayload.idToken);

  }, [tokenStore.tokenPayload?.idToken])


  return (
    <Dashboard>
      <PageHeader
        headerLabel="Transcribe"
        introduction="Upload and Transcribe an Audio File." />

      <SmPanel width='100%' maxWidth='900px'>

        {stage === 'form' ?
          <TranscribeForm store={flow.store} /> :
          <ProcessingTranscription store={flow.store} />}

      </SmPanel>
    </Dashboard>
  );
})

type TranscribeFormProps = {
  store: FileTranscriptionStore;
}

export const TranscribeForm = observer(function ({ store }: TranscribeFormProps) {

  return <>
    <HeaderLabel>Upload a File</HeaderLabel>
    <DescriptionLabel>The audio file can be aac, amr, flac, m4a, mp3, mp4, mpeg, ogg, wav.</DescriptionLabel>
    <Box alignSelf='stretch' pt={4}>
      <FileUploadComponent onFileSelect={file => flow.assignFile(file)} />
    </Box>

    <HeaderLabel pt={8}>Configure Transcription Options</HeaderLabel>
    <DescriptionLabel>Choose the best features to suit your transcription requirements.</DescriptionLabel>

    <Flex width='100%' wrap='wrap' gap={6} pt={4}>
      <SelectField data-qa="select-transcribe-language" label="Language" tooltip='Expected language of transcription'
        data={languagesData} onSelect={val => store.language = val} />

      <SelectField data-qa="select-transcribe-separation" label="Separation" tooltip='Separation of transcription'
        data={separation} onSelect={val => store.separation = val as any} />

      <SelectField data-qa="select-transcribe-accuracy" label="Accuracy" tooltip="Accuracy model"
        data={accuracyModels} onSelect={val => store.accuracy = val as any} />
    </Flex>
    <Flex width='100%' justifyContent='center' py={2}>
      <Button data-qa="button-get-transcription" variant='speechmatics' fontSize='18' width='100%'
        onClick={() => flow.attemptSendFile()}
        disabled={!store._file || !store.secretKey}>
        Get Your Transcription
      </Button>
    </Flex>
  </>
})

type ProcessingTranscriptionProps = {
  store: FileTranscriptionStore;
}

export const ProcessingTranscription = observer(function ({ store }: ProcessingTranscriptionProps) {

  const { stage, fileName, fileSize, jobId } = store;

  useEffect(() => {
    return () => {
      flow.stopPolling();
    }
  }, [])


  return <Flex alignSelf='stretch' alignItems='center' direction='column' pt={4}>

    {stage == 'pendingFile' &&
      <PendingLabelsSlots
        icon={FileProcessingIcon}
        title={'Your Transcription File Is Being Sent.'}
        subtitle={<>Your file size is:
          <Text as='span' fontFamily='RMNeue-Bold' color='smGreen.500'> {fileSize}</Text>.
        </>}
        subtitle2={'This page will automatically fetch and show you the results.'}
      />}

    {stage == 'pendingTranscription' && <PendingLabelsSlots
      icon={FileProcessingIcon}
      title={'Your Transcription File Is Being Sent.'}
      subtitle={<>Status of your job (ID: {jobId}) is:
        <Text as='span' fontFamily='RMNeue-Bold' color='smGreen.500'> Running</Text>.
      </>}
      subtitle2={'This page will automatically fetch and show you the results.'}
    />}


    {stage == 'failed' && <PendingLabelsSlots
      icon={FileProcessingFailedIcon}
      title='Your Transcription Has Failed.'
      subtitle={<>Status of your job (ID: {jobId}) is:
        <Text as='span' fontFamily='RMNeue-Bold' color='smRed.500'> Failed</Text>.
      </>}
      subtitle2={<>You have reached your monthly usage limit. Please
        {' '}<Link href='/manage-billing'>
          <a className="text_link">Add a Payment Card</a>
        </Link> to increase your limit.</>}
    />}

    {stage == 'complete' && <PendingLabelsSlots
      icon={CompleteIcon}
      title='Your Transcription Is Ready.'
      subtitle={`Transcription of: "${fileName}"`}
      subtitle2={<></>}
    />}

    {stage != 'complete' && <FileProcessingProgress stage={stage} my={4} />}

    {stage == 'complete' &&
      <TranscriptionViewer my={4} date={store.dateSubmitted} jobId={store.jobId}
        accuracy={store.accuracy} language={store.language} downloadLink=""
        transcriptionText={store.transcriptionText} />}


    {stage != 'complete' && <Divider my={8} color='smBlack.200' />}

    <Box width='100%' textAlign='center' fontSize='1.2em' color='smNavy.400' my={4}>
      Go to the <Link data-qa="link-recent-jobs" href='/usage#recent-jobs'><a className="text_link">Recent Jobs</a></Link>
      {' '}page to view all your recent transcriptions.
    </Box>

    <Button data-qa="button-transcribe-another-file" variant='speechmaticsOutline' onClick={() => flow.reset()}>Transcribe Another File</Button>

  </Flex>
})

const PendingLabelsSlots = ({ icon, title, subtitle, subtitle2 }) => (<>

  {icon({ width: 64, height: 64 })}

  <Box fontFamily='RMNeue-Bold' fontSize='3xl' p={2} textAlign='center'>
    {title}
  </Box>

  <Box color='smNavy.400' fontSize='1.2em'>{subtitle}</Box>
  <Box textAlign='center' color='smBlack.300'>{subtitle2}</Box>
</>
)
