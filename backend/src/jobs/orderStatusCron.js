const ordersModel = require('../models/orders.model');

const ONE_MINUTE_MS = 60 * 1000;

function startOrderStatusCron() {
  const runTick = async () => {
    try {
      const result = await ordersModel.transitionOrderStatuses();
      const totalTransitions =
        result.placedToPackaged + result.packagedToEnroute + result.enrouteToArrived;

      if (totalTransitions > 0) {
        console.log(
          `[order-cron] transitioned orders: placed->packaged=${result.placedToPackaged}, packaged->enroute=${result.packagedToEnroute}, enroute->arrived=${result.enrouteToArrived}`
        );
      }
    } catch (error) {
      console.error('[order-cron] failed to transition order statuses:', error.message);
    }
  };

  const intervalId = setInterval(runTick, ONE_MINUTE_MS);
  console.log('[order-cron] started (runs every 1 minute)');

  return () => {
    clearInterval(intervalId);
    console.log('[order-cron] stopped');
  };
}

module.exports = {
  startOrderStatusCron,
};
