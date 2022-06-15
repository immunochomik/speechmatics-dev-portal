import { VStack, Box, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { trackEvent } from "../utils/analytics";


export const HomeBox = ({ bgColor, icon, iconPadding = '24px', text, buttonLabel, hrefUrl }) => {
  return (
    <VStack
      width='100%'
      bg={bgColor}
      borderRadius='2px'
      p='1.5em'
      spacing='1em'
      justifyContent='space-between'>
      <VStack>
        <Box borderRadius='full' width='88px' height='88px' bg='smWhite.150' p={iconPadding}>
          {icon}
        </Box>
        <Box
          fontFamily='RMNeue-Bold'
          fontSize='1.5em'
          lineHeight='1.2em'
          textAlign='center'
          color='smWhite.500'
          paddingX='1.8em'>
          {text}
        </Box>
      </VStack>
      <Link href={hrefUrl}>
        <Button variant='speechmaticsWhite' color={bgColor}
          onClick={() => { trackEvent('home_box_click', 'CTAs', buttonLabel) }}>
          {buttonLabel}
        </Button>
      </Link>
    </VStack>
  );
};
