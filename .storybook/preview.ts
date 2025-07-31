import type { Preview } from '@storybook/nextjs'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0f172a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
    docs: {
      theme: 'dark',
    },
  },
  globalTypes: {
    darkMode: {
      defaultValue: true,
    },
  },
};

export default preview;