require(`dotenv`).config({
  path: `.env`,
});

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE;
const feed = true;
const feedTitle = `Raphael Berube - personnal web site`;

const newsletterFeed = require(`./src/utils/newsletterFeed`);

module.exports = {
  siteMetadata: {
    siteTitle: `Raphael Berube`,
    siteTitleAlt: `Raphael Berube`,
    siteHeadline: `Raphael Berube - personnal web site`,
    siteUrl: `https://raphberube.com`,
    siteDescription: `Raphael Berube - personnal web site`,
    siteLanguage: `en`,
    siteImage: `/banner.jpg`,
    author: `@raph84`,
  },

  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Raphael Berube`,
        short_name: `Raphael Berube`,
        description: `Personnal web site.`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#6B46C1`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`,
    shouldAnalyseBundle && {
      resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
      options: {
        analyzerMode: `static`,
        reportFilename: `_bundle.html`,
        openAnalyzer: false,
      },
    },
    {
      resolve: `@raph84/gatsby-theme-minimal-blog-core`,
      options: {
        navigation: [
          {
            title: `Blog`,
            slug: `/blog`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
        ],
        externalLinks: [
          {
            name: `GitHub`,
            url: `https://github.com/raph84`,
          },
        ],
      },
    },
    feed && {
      resolve: `gatsby-plugin-feed`,
      options: newsletterFeed(feedTitle),
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-theme-ui`,
  ].filter(Boolean),
};
