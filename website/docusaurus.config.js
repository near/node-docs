// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

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
    "https://use.fontawesome.com/releases/v5.15.4/js/all.js",
  ],
  themes: ["@saucelabs/theme-github-codeblock",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexPages: false,
        indexBlog: false,
        docsRouteBasePath: ['/'],
        docsDir: ["../docs"],
        language: ["en"],
      },
    ],
  ],
  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap",
    "https://cdn.statically.io/gh/nearprotocol/near-global-footer/main/footer.css",
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
          "editUrl": "https://github.com/near/node-docs/edit/main/website",
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
          trackingID: 'G-SCPT56S1DQ',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
      },
      navbar: {
        title: 'Node Docs',
        logo: {
          alt: 'NEAR Logo',
          src: 'img/near_logo.svg',
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
      prism: {
        "additionalLanguages": [
          "rust", "java", "python", "ruby", "go", "toml"
        ]
      },
    }),
};

module.exports = config;
