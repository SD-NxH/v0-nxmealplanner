import type React from "react"

interface LogoProps {
  className?: string
}

const NxHealthLogo: React.FC<LogoProps> = ({ className }) => (
  <img src="/images/nxhealth-logo.png" alt="NxHealth Solutions Logo" className={`rounded-md ${className}`} />
)

export default NxHealthLogo
