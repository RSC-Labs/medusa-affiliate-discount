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

import { Customer, Discount, SoftDeletableEntity, generateEntityId } from "@medusajs/medusa"
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, BeforeInsert } from 'typeorm';

@Entity()
export class AffiliateDiscount extends SoftDeletableEntity {
    @PrimaryGeneratedColumn()
    id: string;
  
    @ManyToOne(() => Customer, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
  
    @ManyToOne(() => Discount, { eager: true })
    @JoinColumn({ name: 'discount_id' })
    discount: Discount;
  
    @Column()
    commission: number;

    @Column({ default: 0 })
    usage_count: number;

    @Column({ default: 0 })
    earnings: number;

    @Column()
    currency_code: string;

    /**
     * @apiIgnore
     */
    @BeforeInsert()
    private beforeInsert(): void {
        this.id = generateEntityId(this.id, "affdisc")
    }
}