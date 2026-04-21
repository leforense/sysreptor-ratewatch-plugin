/**
 * RateWatch plugin entrypoint.
 * Registers the plugin as a top-level menu entry in SysReptor.
 * Called once when the SysReptor SPA loads in the browser.
 */
export default function (options) {
  options.pluginHelpers.addRoute({
    scope: 'main',
    route: {
      path: '',
      component: () => options.pluginHelpers.iframeComponent({
        src: 'index.html',
      }),
    },
    menu: {
      title: 'RateWatch',
    },
  });
}
