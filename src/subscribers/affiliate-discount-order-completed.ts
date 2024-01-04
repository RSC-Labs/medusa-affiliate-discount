/*
 * Copyright (c) 2024 RSC-Labs, https://rsoftcon.com/. All rights reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
  } from "@medusajs/medusa"
import AffiliateDiscountService, { AdjustmentItemType } from "../services/affiliateDiscount";

  export default async function affiliateDiscountOrderHandler({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, any>>) {
    if (pluginOptions['updateWhen'] && pluginOptions['updateWhen'] == 'PAYMENT_CAPTURED') {
      if (eventName && eventName !== OrderService.Events.PAYMENT_CAPTURED) {
          return;
        }
    } else {
      if (eventName && eventName !== OrderService.Events.COMPLETED) {
        return; 
      }
    }

    const orderService: OrderService = container.resolve('orderService');
    const order = await orderService.retrieve(data.id, {
      select: ["id", "discounts", "items"],
      relations: ["discounts", "items.adjustments"]
    });

    const adjustmentItems: AdjustmentItemType[] = order.items.flatMap(item => {
      let results: AdjustmentItemType[] = [];
      item.adjustments.forEach(adjustment => {
        results.push({
          unitPrice: item.unit_price * item.quantity,
          discountId: adjustment.discount_id
        })
      })
      return results;
    });
  
    const affiliateDiscountService: AffiliateDiscountService = container.resolve('affiliateDiscountService');

    await affiliateDiscountService.incrementUsageCountAndEarnings(adjustmentItems);
  }
  
  export const config: SubscriberConfig = {
    event: [
      OrderService.Events.PAYMENT_CAPTURED,
      OrderService.Events.COMPLETED
    ],
    context: {
      subscriberId: "affiliate-discount-order-handler",
    },
  }