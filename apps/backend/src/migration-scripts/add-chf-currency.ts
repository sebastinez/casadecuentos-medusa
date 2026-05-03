import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function add_chf_currency({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Adding CHF currency to store...");

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.*"],
  });

  const store = stores[0];
  if (!store) {
    throw new Error("No store found");
  }

  const existingCurrencies = (store.supported_currencies ?? []).map(
    (c: { currency_code: string; is_default?: boolean; is_tax_inclusive?: boolean }) => ({
      currency_code: c.currency_code,
      is_default: c.is_default ?? false,
      is_tax_inclusive: c.is_tax_inclusive ?? false,
    })
  );

  const alreadyHasChf = existingCurrencies.some(
    (c: { currency_code: string }) => c.currency_code === "chf"
  );

  if (alreadyHasChf) {
    logger.info("CHF currency already exists, skipping store update.");
  } else {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            ...existingCurrencies,
            { currency_code: "chf", is_default: false },
          ],
        },
      },
    });
    logger.info("Added CHF to store supported currencies.");
  }

  logger.info("Creating Switzerland region...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Switzerland",
          currency_code: "chf",
          countries: ["ch"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  logger.info(`Created Switzerland region: ${regionResult[0].id}`);

  logger.info("Creating Switzerland tax region...");
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "ch", provider_id: "tp_system" }],
  });
  logger.info("Finished. CHF currency and Switzerland region are ready.");
}
