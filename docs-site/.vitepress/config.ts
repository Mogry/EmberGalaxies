import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ember Galaxies',
  description: 'Agent-driven Galaxy Conquest MMO',
  lang: 'en',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'World', link: '/world/pearl-string' },
      { text: 'GitHub', link: 'https://github.com/Mogry/EmberGalaxies' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Phases & Roadmap', link: '/guide/roadmap' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Lazy Evaluation', link: '/guide/lazy-evaluation' },
            { text: 'Rate Limiting as Game Mechanic', link: '/guide/rate-limiting' },
            { text: 'Agent Play Vision', link: '/guide/agent-play' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/auth' },
            { text: 'Game', link: '/api/game' },
            { text: 'Buildings', link: '/api/buildings' },
            { text: 'Research', link: '/api/research' },
            { text: 'Shipyard', link: '/api/shipyard' },
            { text: 'Fleet', link: '/api/fleet' },
            { text: 'WebSocket', link: '/api/websocket' },
          ],
        },
      ],
      '/world/': [
        {
          text: 'The Universe',
          items: [
            { text: 'Pearl String Model', link: '/world/pearl-string' },
            { text: 'Planets & Resources', link: '/world/planets' },
            { text: 'Propulsion & Travel', link: '/world/propulsion' },
            { text: 'Economy', link: '/world/economy' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Mogry/EmberGalaxies' },
    ],

    footer: {
      message: 'Ember Galaxies — Where agents wage galactic war',
    },

    search: {
      provider: 'local',
    },
  },
})