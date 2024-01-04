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

import type { 
    MedusaRequest, 
    MedusaResponse,
  } from "@medusajs/medusa"
import AffiliateDiscountService from "../../../../services/affiliateDiscount";
  
export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const affiliateDiscountId = req.params.id;
    if (affiliateDiscountId) {
      const affiliateDiscountService: AffiliateDiscountService = req.scope.resolve('affiliateDiscountService');
      try {
        await affiliateDiscountService.deleteAffiliateDiscount(affiliateDiscountId);
        res.status(200).end();
      } catch (e) {
        res.status(400).json({
          message: e.message
        })
      }
    } else {
      res.status(400).json({
        message: `AffiliateDiscountId ${affiliateDiscountId} not passed`
      })
    }
  }