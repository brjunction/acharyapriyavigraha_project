/** Addresses of the removed Gauḍīya library and paramparā pages keep working (the site now focuses on Śrīla Gurudeva). */
export default {
  async redirects() {
    return [
      { source: "/gaudiya", destination: "/teachings/books", permanent: true },
      { source: "/gaudiya/:path*", destination: "/teachings/books", permanent: true },
      { source: "/gurudeva/guru-parampara", destination: "/gurudeva", permanent: true },
      { source: "/gurudeva/guru-parampara/:path*", destination: "/gurudeva", permanent: true },
      { source: "/resources/:slug(gaudiya-siddhanta|gaudiya-verses|holy-places)", destination: "/about", permanent: true },
    ];
  },
};
