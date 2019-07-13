import loadScript from "discourse/lib/load-script";
import { withPluginApi } from "discourse/lib/plugin-api";
const { run } = Ember;

export default {
  name: "discourse-graphviz",

  renderGraph($container) {
    const graphDefinition = $container.text();
    const engine = $container.attr("data-engine");

    const $spinner = $("<div class='spinner tiny'></div>");
    $container.html($spinner);

    loadScript("/plugins/discourse-graphviz/javascripts/viz-2.1.2.js").then(
      () => {
        $container.removeClass("is-loading");

        try {
          /* global Viz */
          const svgChart = Viz(graphDefinition, {
            format: "svg",
            engine
          });
          $container.html(svgChart);
        } catch (e) {
          // graphviz error are unhelpful so we just show a default error
          const $error = $(
            "<div class='graph-error'>Error while rendering graph.</div>"
          );
          $container.html($error);
        }
      }
    );
  },

  initialize() {
    withPluginApi("0.8.22", api => {
      api.decorateCooked(
        $elem => {
          const $graphviz = $elem.find(".graphviz");

          if (
            $graphviz.length &&
            Discourse.SiteSettings.discourse_graphviz_enabled
          ) {
            $graphviz.each((_, nodeContainer) => {
              const $container = $(nodeContainer);

              // if the container content has not yet been replaced
              // do nothing
              if (!$container.find("svg").length) {
                run.debounce(this, this.renderGraph, $container, 200);
              }
            });
          }
        },
        { id: "graphviz" }
      );
    });
  }
};
