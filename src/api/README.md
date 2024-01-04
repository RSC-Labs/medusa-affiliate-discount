```yaml
openapi: 3.0.0
info:
  title: medusa-affiliate-discount API
  description: API for plugin
  version: 0.0.1
paths:
  /admin/affiliate-discount:
    post:
      summary: Create affiliate discount
      description: API to create new affiliate discount
      parameters:
        - name: customerId
          in: query
          description: ID of customer
          required: true
          schema:
            type: string
        - name: discountId
          in: query
          description: ID of discount
          required: true
          schema:
            type: string
        - name: commission
          in: query
          description: Commission for affiliate, in percentage
          required: true
          schema:
            type: number
      responses:
        '201':
          description: Affiliate discount created
          content:
            application/json:
              schema: 
                type: object
                properties:
                  id:
                    type: string
                  customerId:
                    type: string
                  customerEmail:
                    type: string
                  discountId:
                    type: string
                  discountCode:
                    type: string
                  commission:
                    type: number
                  usageCount:
                    type: number
                  earnings:
                    type: number
                  currencyCode:
                    type: string
        '400':
          description: Error happened when creating
          content:
            application/json:
              schema: 
                type: object
                properties:
                  message:
                    type: string
    
  /admin/affiliate-discount/{id}:
    delete:
      summary: Delete affiliate discount
      description: Delete affiliate discount
      parameters:
        - name: id
          in: path
          description: ID of affiliate discount
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Affiliate discount deleted
        '400':
          description: Error happened when deleting
          content:
            application/json:
              schema: 
                type: object
                properties:
                  message:
                    type: string
  /admin/affiliate-discount/customer/{id}:
    get:
      summary: Get affiliate discount by customerId
      description: Get affiliate discount by customerId
      parameters:
        - name: id
          in: path
          description: ID of customer
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Affiliate discount
          content:
            application/json:
              schema: 
                type: object
                properties:
                  id:
                    type: string
                  customerId:
                    type: string
                  customerEmail:
                    type: string
                  discountId:
                    type: string
                  discountCode:
                    type: string
                  commission:
                    type: number
                  usageCount:
                    type: number
                  earnings:
                    type: number
                  currencyCode:
                    type: string
        '400':
          description: Error happened when getting
          content:
            application/json:
              schema: 
                type: object
                properties:
                  message:
                    type: string
  /admin/affiliate-discount/discount/{id}:
    get:
      summary: Get affiliate discount by discountId
      description: Get affiliate discount by discountId
      parameters:
        - name: id
          in: path
          description: ID of discount
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Affiliate discount
          content:
            application/json:
              schema: 
                type: object
                properties:
                  id:
                    type: string
                  customerId:
                    type: string
                  customerEmail:
                    type: string
                  discountId:
                    type: string
                  discountCode:
                    type: string
                  commission:
                    type: number
                  usageCount:
                    type: number
                  earnings:
                    type: number
                  currencyCode:
                    type: string
        '400':
          description: Error happened when getting
          content:
            application/json:
              schema: 
                type: object
                properties:
                  message:
                    type: string
```