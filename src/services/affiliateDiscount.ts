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

import { Customer, Discount, Product, TransactionBaseService } from "@medusajs/medusa"
import { AffiliateDiscount } from "../models/affiliate-discount";

type AffiliateDiscountResult = {
  id: string,
  customerId: string,
  customerEmail: string,
  discountId: string,
  discountCode: string,
  commission: number,
  usageCount: number,
  earnings: number,
  currencyCode: string
}

export type AdjustmentItemType = {
  unitPrice: number,
  discountId: string
}

class AffiliateDiscountService extends TransactionBaseService {

  async getAffiliateDiscountsByCustomerId(customerId: string) : Promise<AffiliateDiscountResult[]> {

    const existingEntries = await this.activeManager_
      .getRepository(AffiliateDiscount)
      .createQueryBuilder('affdisc')
      .leftJoinAndSelect('affdisc.customer', 'customer')
      .leftJoinAndSelect('affdisc.discount', 'discount')
      .where('customer_id = :customerId', {
        customerId
      })
      .getMany();

    return existingEntries.map(entry => {
      return {
        id: entry.id,
        customerId: entry.customer.id,
        customerEmail: entry.customer.email,
        discountId: entry.discount.id,
        discountCode: entry.discount.code,
        commission: entry.commission,
        usageCount: entry.usage_count,
        earnings: entry.earnings,
        currencyCode: entry.currency_code
      }
    });
  }

  async getAffiliateDiscountsByDiscountId(discountId: string) : Promise<AffiliateDiscountResult[]> {

    const existingEntries = await this.activeManager_
      .getRepository(AffiliateDiscount)
      .createQueryBuilder('affdisc')
      .leftJoinAndSelect('affdisc.customer', 'customer')
      .leftJoinAndSelect('affdisc.discount', 'discount')
      .where('discount_id = :discountId', {
        discountId
      })
      .getMany();


    return existingEntries.map(entry => {
      return {
        id: entry.id,
        customerId: entry.customer.id,
        customerEmail: entry.customer.email,
        discountId: entry.discount.id,
        discountCode: entry.discount.code,
        commission: entry.commission,
        usageCount: entry.usage_count,
        earnings: entry.earnings,
        currencyCode: entry.currency_code
      }
    });
  }

  async createAffiliateDiscount(customerId: string, discountId: string, commission: number) : Promise<AffiliateDiscountResult> {
    const count = await this.activeManager_
      .getRepository(AffiliateDiscount)
      .createQueryBuilder("affdisc")
      .select(["affdisc.customer_id", "affdisc.discount_id"])
      .where('affdisc.customer_id = :customerId', {
        customerId
      })
      .andWhere('affdisc.discount_id = :discountId', {
        discountId
      })
      .getCount();
    if (count) {
      throw new Error('Cannot create affiliate discount because it already exists');
    }

    function isInt(value) {
      var x;
      if (isNaN(value)) {
        return false;
      }
      x = parseFloat(value);
      return (x | 0) === x;
    }
    
    if (!isInt(commission) || commission < 1 || commission > 100) {
      throw new Error('Commission shall be integer between 1 and 100');
    }
    const discount = await this.activeManager_.getRepository(Discount).findOne({
      where: { id: discountId },
      relations: { regions: true }
    });
    
    if (discount.regions.length !== 1) {
      throw new Error('Affiliate discount can be applied only to discount which has one region as it support only one currency');
    }

    const newEntry = new AffiliateDiscount();
    newEntry.customer = await this.activeManager_.getRepository(Customer).findOne({
      where: { id: customerId }
    });
    newEntry.discount = discount;
    newEntry.usage_count = 0;
    newEntry.earnings = 0;
    newEntry.commission = commission;
    newEntry.currency_code = discount.regions[0].currency_code;
    const result = await this.activeManager_.getRepository(AffiliateDiscount).save(newEntry);
    return {
      id: result.id,
      customerId: result.customer.id,
      customerEmail: result.customer.email,
      discountId: result.discount.id,
      discountCode: result.discount.code,
      commission: result.commission,
      usageCount: result.usage_count,
      earnings: result.earnings,
      currencyCode: result.currency_code
    }
  }

  async deleteAffiliateDiscount(affiliateDiscountId: string, deleteOption?: string ) : Promise<void> {
    if (deleteOption && deleteOption == 'hard') {
      await this.activeManager_.getRepository(AffiliateDiscount).delete(affiliateDiscountId);
    }
    else {
      const affiliateDiscount = await this.activeManager_
        .getRepository(AffiliateDiscount)
        .findOne({ where: { id: affiliateDiscountId } })
      if (!affiliateDiscount) {
        throw new Error(`Cannot find affiliate discount with id ${affiliateDiscountId}`);
      }
      await this.activeManager_.getRepository(AffiliateDiscount).softDelete(affiliateDiscountId);
    }
  }

  async incrementUsageCountAndEarnings(adjustmentItems: AdjustmentItemType[]) : Promise<AffiliateDiscount[]> {
    const existingEntries = await this.activeManager_
      .getRepository(AffiliateDiscount)
      .createQueryBuilder("affdisc")
      .leftJoinAndSelect("affdisc.discount", "discount")
      .where('affdisc.discount_id IN (:...discounts)', {
        discounts: adjustmentItems.flatMap(adjustmentItem => adjustmentItem.discountId)
      })
      .getMany();
    const results = await Promise.all(
      existingEntries.map(async ( existingEntry ) => {
        if (existingEntry) {
          existingEntry.usage_count += 1;
          const adjustmentItemsRelatedToAffiliateDiscount = adjustmentItems.filter(adjustmentItem => adjustmentItem.discountId == existingEntry.discount.id);
          existingEntry.earnings += Math.round((adjustmentItemsRelatedToAffiliateDiscount.reduce((previousValue, currentValue) => previousValue + currentValue.unitPrice, 0) * existingEntry.commission * 0.01));
          return await this.activeManager_.getRepository(AffiliateDiscount).save(existingEntry);
        }
      })
    )
    return results;
  }
}
export default AffiliateDiscountService