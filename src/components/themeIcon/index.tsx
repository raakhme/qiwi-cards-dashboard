import { Pane } from 'evergreen-ui'
import { useThemeContext } from '../../themes/provider'

export const ThemeIcon = () => {
  const { theme } = useThemeContext()

  return theme === 'light' ? (
    <Pane backgroundColor="black" borderRadius="50%" width={20} height={20} />
  ) : (
    <Pane backgroundColor="white" borderRadius="50%" width={20} height={20} />
  )
}
