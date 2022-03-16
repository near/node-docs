// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'NEAR Nodes',
  tagline: 'NEAR Node Documentation',
  url: 'https://near-nodes.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'near', // Usually your GitHub org/user name.
  projectName: 'node-docs', // Usually your repo name.
  scripts: [
    "/js/hotjar.js",
  ],
  plugins: [require.resolve('docusaurus-lunr-search')],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          "editUrl": "https://github.com/near/node-docs/edit/master/website",
          remarkPlugins: [math],
          rehypePlugins: [katex],
          "showLastUpdateAuthor": true,
          "showLastUpdateTime": true,
          "path": "../docs",
          "routeBasePath": '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        gtag: {
          trackingID: 'G-9D4HYSTV6N',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Node Docs',
        logo: {
          alt: 'NEAR Logo',
          src: 'img/near_logo.svg',
          srcDark: 'img/near_logo_white.svg',
        },
        items: [
          {
            to: '/',
            label: 'Nodes',
            position: 'left'
          },
          {
            href: 'https://nomicon.io/',
            label: 'Protocol Specs',
            position: 'left',
          },
          {
            href: 'https://docs.near.org/',
            label: 'Dev Docs',
            position: 'left',
          },
          {
            href: 'https://wiki.near.org/',
            label: 'Wiki',
            position: 'left',
          },
          {
            href: 'https://github.com/near/node-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Nodes',
                to: '/',
              },
              {
                label: 'Specification',
                to: 'https://nomicon.io',
              },
              {
                label: 'Dev Docs',
                to: 'https://docs.near.org',
              },
              {
                label: 'Wiki',
                to: 'https://wiki.near.org',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/nearprotocol',
              },
              {
                label: 'Discord',
                href: 'https://near.chat',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/NEARProtocol',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'SDK Docs',
                to: 'https://near-sdk.io/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/near/node-docs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://near.org">NEAR Protocol</a> | All rights reserved | hello@near.org`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        "additionalLanguages": [
          "rust", "java", "python", "ruby", "go", "toml"
        ]
      },
    }),
};

module.exports = config;
