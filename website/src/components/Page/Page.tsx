import React from 'react'
import styled from 'styled-components'

import Footer from 'components/Footer'

const Page: React.FC = ({ children }) => (
  <StyledPage>
    <StyledMain>{children}</StyledMain>
    <Footer />
  </StyledPage>
)

const StyledPage = styled.div``

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 144px);
  padding: ${props => props.theme.spacing[6]}px 0;
`

export default Page
