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

import type { WidgetConfig, CustomerDetailsWidgetProps } from "@medusajs/admin"
import { Container, useToggleState, Table, Button, Heading, DropdownMenu, IconButton, clx, usePrompt, Select, FocusModal, Input, toast, Toaster} from "@medusajs/ui"
import { useForm, Controller, Control, UseFormRegister } from "react-hook-form"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper
} from "@tanstack/react-table"

import { useAdminCustomPost, useAdminCustomQuery, useAdminCustomDelete } from "medusa-react"
import { EllipsisHorizontal, Trash } from "@medusajs/icons"
import { useAdminDiscounts } from "medusa-react"
import React from "react"

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

type NewAffiliateDiscountFormType = {
  customerId: string,
  discountId: string
  commission: number
}

const getErrorMessage = (error: any) => {
  console.log(error);
  let msg = error?.response?.data?.message
  if (msg[0].message) {
      msg = msg[0].message
  }
  if (!msg) {
      msg = "Something went wrong..."
  }
  return msg
}

const AffilateDiscountsTableActions = ({ affiliateDiscountId }: { affiliateDiscountId: string }) => {

  const prompt = usePrompt();
  const { mutateAsync } = useAdminCustomDelete<{}>
  (
    `/affiliate-discount/${affiliateDiscountId}`,
    ["affiliate-discount"],
  )

  const onDelete = async () => {
    const response = await prompt({
      title: "Are you sure?",
      description:
        "This will delete affiliate discount. This operation cannot be reverted.",
    })

    if (!response) {
      return
    }

    try {
      await mutateAsync(undefined, {
        onSuccess: ({ response }) => {
          if (response.status == 200) {
            toast.success('Affiliate discount', {
              description: "Your affiliate discount has been deleted",
              duration: 5000
            });
          }

          if (response.status != 200) {
            toast.error('Affiliate discount', {
              description: "Failed to delete affiliate discount",
              duration: 5000
            });
          }
        },
        onError( error ) {
          const realError = getErrorMessage(error);
          toast.error('Affiliate discount', {
            description: realError,
            duration: 5000
          });
        },
      })
    } catch (e) {
      toast.error('Affiliate discount', {
        description: "Failed to delete affiliate discount",
        duration: 5000
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" side="bottom">
        <DropdownMenu.Item 
          onClick={onDelete}
          className={clx(
            {
              "text-rose-50": true,
            },
            "px-base py-[6px] outline-none flex items-center gap-x-xsmall hover:bg-grey-5 focus:bg-grey-10 transition-colors cursor-pointer",
            "hover:bg-grey-0"
          )}
        >
          <Trash/>
          <span>Delete</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

const columnHelper = createColumnHelper<AffiliateDiscountResult>()

const columns = [
columnHelper.accessor("customerEmail", {
  header: "Customer",
  cell: (info) => info.getValue(),
}),
columnHelper.accessor("discountCode", {
  header: "Discount code",
  cell: (info) => info.getValue(),
}),
columnHelper.accessor("commission", {
  header: "Commission",
  cell: (info) => `${info.getValue()}%`,
}),
columnHelper.accessor("usageCount", {
  header: "Usage count",
  cell: (info) => (
    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
      {info.getValue()}
    </span>
  ),
}),
columnHelper.display({
  id: 'earnings',
  header: "Earnings",
  cell: props => (
    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
      {`${props.row.original.earnings / 100} ${props.row.original.currencyCode}`}
    </span>
  ),
}),
columnHelper.display({
  id: 'actions',
  cell: props => <AffilateDiscountsTableActions affiliateDiscountId={props.row.original.id} />,
}),
]


const AffilateDiscountsTable = ({affiliateDiscounts} : {affiliateDiscounts: AffiliateDiscountResult[]}) => {
  const table = useReactTable<AffiliateDiscountResult>({
    data: affiliateDiscounts || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <Table.Row
              key={headerGroup.id}
              className="[&_th]:w-1/5 [&_th:last-of-type]:w-[1%]"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <Table.HeaderCell key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Table.HeaderCell>
                )
              })}
            </Table.Row>
          )
        })}
      </Table.Header>
      <Table.Body className="border-b-0">
        {table.getRowModel().rows.map((row) => {
          return (
          <Table.Row
            key={row.id}
            className="[&_th]:w-1/5 [&_th:last-of-type]:w-[1%]"
          >
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </Table.Cell>
            ))}
          </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

const DiscountList = ({control} : { control: Control<NewAffiliateDiscountFormType, any>}) => {

  const { discounts, isFetching: isFetchingDiscounts } = useAdminDiscounts();
  if (isFetchingDiscounts) {
    return <></>
  }

  return (
    <Controller
      name="discountId"
      control={control}
      defaultValue=""
      render={({ field: { onChange, value } }) => {
        return (
          <Select
            size="small"
              value={value}
              onValueChange={onChange}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
                {discounts.map((discount) => (
                  <Select.Item key={discount.id} value={discount.id}>
                    {discount.code}
                  </Select.Item>
                ))}
              </Select.Content>
          </Select>
        )
      }}
    />
  )
}

const ChooseDiscount = ({control} : { control: Control<NewAffiliateDiscountFormType, any>}) => {
  return (
    <>
      <div className="border-grey-20 py-xlarge border-t">
        <div className="flex items-center justify-between">
          <div className="gap-y-2xsmall flex flex-col">
            <div className="gap-x-xsmall flex items-center">
              <h2 className="inter-base-semibold">
                {`Choose discount`}
              </h2>
            </div>
          </div>
          <div className="w-[200px]">
            <DiscountList control={control}/>
          </div>
        </div>
      </div>
   </>
  )
}

const InputCommission = ({control, register, errors} : 
  { control: Control<NewAffiliateDiscountFormType, any>, register: UseFormRegister<NewAffiliateDiscountFormType>, errors: any}) => {
    
  return (
    <>
      <div className="border-grey-20 py-xlarge border-t">
        <div className="flex items-center justify-between">
          <div className="gap-y-2xsmall flex flex-col">
            <div className="gap-x-xsmall flex items-center">
              <h2 className="inter-base-semibold">
                {`Define commission (%)`}
              </h2>
            </div>
          </div>
          <div className="w-[100px]">
            <Controller
                name="commission"
                control={control}
                render={() =>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]+$"
                    step={1}
                    placeholder="5"
                    min={1}
                    max={100}
                    maxLength={3}
                    {...register("commission", {
                      required: "This field is required",
                      valueAsNumber: true,
                      shouldUnregister: true,
                    })}
                  />
                }
              />
          </div>
        </div>
      </div>
   </>
  )
}





type AdminAffiliateDiscountPostReq = {
  customerId: string,
  discountId: string,
  commission: number,
}

const CreateAffDiscForm = ({ customerId } : { customerId: string }) => {

  const {
    state: modalState,
    open: openModal,
    close: closeModal
  } = useToggleState();

  const { mutate } = useAdminCustomPost<
    AdminAffiliateDiscountPostReq,
    AffiliateDiscountResult
  >(
    `/affiliate-discount`,
    ["affiliate-discount"]
   )

  const { control, handleSubmit, register, formState: {errors} } = useForm<NewAffiliateDiscountFormType>({
    defaultValues: {
      customerId: customerId
    }
  })

  const validateCommission = (commission: number) => {
    return commission >= 1 && commission <= 100;
  }

  const onSubmit = (newDiscount: NewAffiliateDiscountFormType) => {
    if (!newDiscount.commission || !newDiscount.customerId || !newDiscount.discountId || !validateCommission(newDiscount.commission)) {
      toast.error('Affiliate discount', {
        description: "Values provided in fields are not correct",
        duration: 5000
      });
      return;
    }
    return mutate(
      {
        customerId: newDiscount.customerId, 
        discountId: newDiscount.discountId, 
        commission: newDiscount.commission
      }, {
      onSuccess: ( { response } ) => {
        if (response.status == 201) {
          toast.success('Affiliate discount', {
            description: "Your affiliate discount has been published",
            duration: 5000
          });
          closeModal()
        }

        if (response.status != 201) {
          toast.error('Affiliate discount', {
            description: "Something went wrong. Please check values in fields.",
            duration: 5000
          });
        }
      },
      onError( error ) {
        const realError = getErrorMessage(error);
        toast.error('Affiliate discount', {
          description: realError,
          duration: 5000
        });
      },
    })
  }


  const onModalStateChange = React.useCallback(
    async (open: boolean) => {
      open ? openModal() : closeModal()
    }, [
      modalState
    ]
  )

  return (
    <>
    <FocusModal open={modalState} onOpenChange={onModalStateChange}>
        <FocusModal.Trigger asChild>
          <Button variant="primary">Create New</Button>
        </FocusModal.Trigger>
        <FocusModal.Content>
          <FocusModal.Header className="flex w-full items-center justify-start">
            <div className="ml-auto flex items-center justify-end gap-x-2">
                <Button
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  className="rounded-rounded"
                >
                  {"Publish affiliate discount"}
                </Button>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="flex h-full w-full flex-col items-center overflow-y-auto">
            <div className="rounded-rounded border-grey-20 pt-large pb-xlarge px-xlarge gap-y-xlarge flex w-full large:max-w-[50%] flex-col bg-white">
              <div className="flex h-full flex-col">
                  <div className="border-ui-border-base flex items-center justify-between pb-4 pt-6">
                    <div className="flex items-center gap-x-3">
                      <Heading>
                        {`New affiliate discount`}
                      </Heading>
                    </div>
                </div>
                <div className="py-xlarge">
                  <ChooseDiscount control={control}/>
                </div>
                <div className="py-xlarge">
                  <InputCommission control={control} register={register} errors={errors}/>
                </div>
              </div>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
    </FocusModal>
    </>
  )
}

type AdminAffiliateDiscountByCustomerIdQuery = {
  customerId: string
}

type AffiliateDiscountResponse = {
  affiliateDiscounts: AffiliateDiscountResult[]
}

const CustomAssignDiscountWidget = (props: CustomerDetailsWidgetProps) => {
  const { data, isLoading } = useAdminCustomQuery<
    AdminAffiliateDiscountByCustomerIdQuery,
    AffiliateDiscountResponse
  >(
    `/affiliate-discount/customer/${props.customer.id}`,
    [""]
  )

  if (isLoading) {
    return <></>
  }

  return (
    <>
    <Toaster/>
    <Container>
      <div className="flex items-center justify-between px-8 pt-6 pb-4">
        <Heading>Affiliate discounts</Heading>
        <div className="flex items-center gap-x-2">
          <CreateAffDiscForm customerId={props.customer.id}/>
        </div>
      </div>
      <AffilateDiscountsTable affiliateDiscounts={data.affiliateDiscounts}/>
    </Container>
    </>
  );
}

export const config: WidgetConfig = {
  zone: "customer.details.after",
}

export default CustomAssignDiscountWidget