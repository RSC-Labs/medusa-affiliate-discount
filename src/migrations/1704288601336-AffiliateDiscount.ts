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

import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class AffiliateDiscount1704288601336 implements MigrationInterface {

    name = 'AffiliateDiscount1704288601336';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'affiliate_discount',
              columns: [
                { name: 'id', type: 'character varying', isPrimary: true },
                { name: 'customer_id', type: 'character varying' },
                { name: 'discount_id', type: 'character varying' },
                { name: 'commission', type: 'float' },
                { name: 'usage_count', type: 'int' },
                { name: 'earnings', type: 'int' },
                { name: 'currency_code', type: 'character varying' },
                { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()'},
                { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()'},
                { name: 'deleted_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true}
              ],
              foreignKeys: [
                {
                  columnNames: ['customer_id'],
                  referencedColumnNames: ['id'],
                  referencedTableName: 'public.customer',
                },
                {
                  columnNames: ['discount_id'],
                  referencedColumnNames: ['id'],
                  referencedTableName: 'public.discount',
                },
              ],
            }),
            true
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('affiliate_discount', true);
    }

}
