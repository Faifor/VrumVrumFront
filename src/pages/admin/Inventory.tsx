import { useEffect, useState } from 'react'
import { useAdminStore } from '@/stores/admin.store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/Toast'
import { extractErrorMessage } from '@/api/client'
import type { AssetStatus, Location, Bike, Battery, BikePricing } from '@/types'
import clsx from 'clsx'

type Tab = 'bikes' | 'batteries' | 'locations' | 'pricing'

const TAB_LABELS: Record<Tab, string> = {
  bikes: 'Велосипеды', batteries: 'АКБ', locations: 'Локации', pricing: 'Тарифы',
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const locationSchema = z.object({
  name:    z.string().min(1, 'Обязательное поле'),
  address: z.string().min(1, 'Обязательное поле'),
})

const bikeSchema = z.object({
  number:            z.string().min(1),
  vin:               z.string().min(1),
  name:              z.string().min(1),
  description:       z.string().optional(),
  status:            z.enum(['free', 'rented', 'repair', 'decommissioned']).default('free'),
  type_id:           z.coerce.number().int().optional(),
  location_id:       z.coerce.number().int().optional(),
  purchase_date:     z.string().optional(),
  last_service_date: z.string().optional(),
  next_service_date: z.string().optional(),
})

const batterySchema = z.object({
  number:        z.string().min(1),
  name:          z.string().min(1),
  description:   z.string().optional(),
  voltage:       z.coerce.number().optional(),
  capacity:      z.coerce.number().optional(),
  status:        z.enum(['free', 'rented', 'repair', 'decommissioned']).default('free'),
  location_id:   z.coerce.number().int().optional(),
  purchase_date: z.string().optional(),
})

const pricingSchema = z.object({
  type_id:         z.coerce.number().int().min(1),
  name_type:       z.string().min(1),
  min_weeks_count: z.coerce.number().int().min(1),
  max_weeks_count: z.coerce.number().int().min(1),
  amount_weeks:    z.coerce.number().int().min(0),
})

// ─── Dark-mode shared select class ────────────────────────────────────────────

const selectCls = clsx(
  'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150',
  'bg-white dark:bg-slate-800/80',
  'text-slate-900 dark:text-slate-100',
  'border-slate-200 dark:border-slate-700',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
  'dark:focus:ring-brand-400/40 dark:focus:border-brand-400',
)

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState<Tab>('bikes')
  const store = useAdminStore()

  useEffect(() => {
    store.fetchBikes()
    store.fetchBatteries()
    store.fetchLocations()
    store.fetchPricing()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Инвентарь</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-700/60 scrollbar-hide">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all duration-150',
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'bikes'     && <BikesTab />}
      {activeTab === 'batteries' && <BatteriesTab />}
      {activeTab === 'locations' && <LocationsTab />}
      {activeTab === 'pricing'   && <PricingTab />}
    </div>
  )
}

// ─── Bikes ────────────────────────────────────────────────────────────────────

function BikesTab() {
  const { bikes, createBike, updateBike, deleteBike } = useAdminStore()
  const [modal, setModal] = useState<Bike | 'new' | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all')

  const form = useForm<z.infer<typeof bikeSchema>>({ resolver: zodResolver(bikeSchema) })
  const filtered = statusFilter === 'all' ? bikes : bikes.filter((b) => b.status === statusFilter)

  const onSubmit = async (data: z.infer<typeof bikeSchema>) => {
    setLoading(true)
    try {
      const payload = {
        number: data.number, vin: data.vin, name: data.name,
        description: data.description ?? null, status: data.status,
        type_id: data.type_id ?? null, location_id: data.location_id ?? null,
        purchase_date: data.purchase_date || null,
        last_service_date: data.last_service_date || null,
        next_service_date: data.next_service_date || null,
      }
      if (modal === 'new') { await createBike(payload); toast.success('Велосипед добавлен') }
      else if (modal) { await updateBike(modal.id, payload); toast.success('Велосипед обновлён') }
      setModal(null)
    } catch (err) { toast.error(extractErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить велосипед?')) return
    try { await deleteBike(id); toast.success('Удалено') }
    catch (err) { toast.error(extractErrorMessage(err)) }
  }

  const openEdit = (bike: Bike) => {
    form.reset({ ...bike, description: bike.description ?? '', type_id: bike.type_id ?? undefined, location_id: bike.location_id ?? undefined, purchase_date: bike.purchase_date ?? '', last_service_date: bike.last_service_date ?? '', next_service_date: bike.next_service_date ?? '' })
    setModal(bike)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {(['all', 'free', 'rented', 'repair', 'decommissioned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                statusFilter === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
              )}
            >
              {s === 'all' ? 'Все' : <StatusBadge status={s} />}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { form.reset({ status: 'free' }); setModal('new') }}>+ Добавить</Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/60 text-left">
              <th className="px-4 py-3 label-muted">Номер / VIN</th>
              <th className="px-4 py-3 label-muted">Название</th>
              <th className="px-4 py-3 label-muted">Статус</th>
              <th className="px-4 py-3 label-muted">Куплен</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 dark:border-slate-700/40 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-slate-700 dark:text-slate-300">{b.number}</p>
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{b.vin}</p>
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{b.name}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{b.purchase_date ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(b)} className="text-brand-600 dark:text-brand-400 hover:underline text-xs font-medium">Изм.</button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-500 dark:text-red-400 hover:underline text-xs font-medium">Удал.</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-600">Нет велосипедов</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((b) => (
          <div key={b.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{b.name}</p>
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{b.number} · {b.vin}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => openEdit(b)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">Изменить</button>
              <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium">Удалить</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-10 text-slate-400 dark:text-slate-600">Нет велосипедов</p>}
      </div>

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Добавить велосипед' : 'Редактировать велосипед'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input label="Номер *" error={form.formState.errors.number?.message} {...form.register('number')} />
          <Input label="VIN *"   error={form.formState.errors.vin?.message}    {...form.register('vin')} />
          <Input label="Название *" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Описание" {...form.register('description')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Статус</label>
            <select className={selectCls} {...form.register('status')}>
              {(['free', 'rented', 'repair', 'decommissioned'] as const).map((s) => (
                <option key={s} value={s}>{{ free: 'Свободен', rented: 'В аренде', repair: 'Ремонт', decommissioned: 'Списан' }[s]}</option>
              ))}
            </select>
          </div>
          <Input label="Тип (type_id)"        type="number" {...form.register('type_id')} />
          <Input label="Локация (location_id)" type="number" {...form.register('location_id')} />
          <Input label="Дата покупки"  type="date" {...form.register('purchase_date')} />
          <Input label="Последнее ТО"  type="date" {...form.register('last_service_date')} />
          <Input label="Следующее ТО"  type="date" {...form.register('next_service_date')} />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" isLoading={loading} className="w-full">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} className="w-full">Отмена</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// ─── Batteries ────────────────────────────────────────────────────────────────

function BatteriesTab() {
  const { batteries, createBattery, updateBattery, deleteBattery } = useAdminStore()
  const [modal, setModal] = useState<Battery | 'new' | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof batterySchema>>({ resolver: zodResolver(batterySchema) })

  const onSubmit = async (data: z.infer<typeof batterySchema>) => {
    setLoading(true)
    try {
      const payload = { ...data, description: data.description ?? null, voltage: data.voltage ?? null, capacity: data.capacity ?? null, location_id: data.location_id ?? null, purchase_date: data.purchase_date ?? null }
      if (modal === 'new') { await createBattery(payload); toast.success('АКБ добавлен') }
      else if (modal) { await updateBattery(modal.id, payload); toast.success('АКБ обновлён') }
      setModal(null)
    } catch (err) { toast.error(extractErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить АКБ?')) return
    try { await deleteBattery(id); toast.success('Удалено') }
    catch (err) { toast.error(extractErrorMessage(err)) }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { form.reset({ status: 'free' }); setModal('new') }}>+ Добавить</Button>
      </div>

      <div className="flex flex-col gap-3">
        {batteries.map((b) => (
          <div key={b.id} className="card p-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{b.name}</p>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{b.number}</p>
              {b.voltage && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.voltage}V · {b.capacity}Ah</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={b.status} />
              <div className="flex gap-3">
                <button
                  onClick={() => { form.reset({ ...b, description: b.description ?? '', location_id: b.location_id ?? undefined, purchase_date: b.purchase_date ?? '', voltage: b.voltage ?? undefined, capacity: b.capacity ?? undefined }); setModal(b) }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >Изм.</button>
                <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium">Удал.</button>
              </div>
            </div>
          </div>
        ))}
        {batteries.length === 0 && <p className="text-center py-10 text-slate-400 dark:text-slate-600">Нет АКБ</p>}
      </div>

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Добавить АКБ' : 'Редактировать АКБ'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input label="Номер *"    {...form.register('number')} />
          <Input label="Название *" {...form.register('name')} />
          <Input label="Описание" {...form.register('description')} />
          <Input label="Напряжение (V)" type="number" {...form.register('voltage')} />
          <Input label="Ёмкость (Ah)"  type="number" {...form.register('capacity')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Статус</label>
            <select className={selectCls} {...form.register('status')}>
              {(['free', 'rented', 'repair', 'decommissioned'] as const).map((s) => (
                <option key={s} value={s}>{{ free: 'Свободен', rented: 'В аренде', repair: 'Ремонт', decommissioned: 'Списан' }[s]}</option>
              ))}
            </select>
          </div>
          <Input label="Дата покупки"          type="date"   {...form.register('purchase_date')} />
          <Input label="Локация (location_id)"  type="number" {...form.register('location_id')} />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" isLoading={loading} className="w-full">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} className="w-full">Отмена</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// ─── Locations ────────────────────────────────────────────────────────────────

function LocationsTab() {
  const { locations, createLocation, updateLocation, deleteLocation } = useAdminStore()
  const [modal, setModal] = useState<Location | 'new' | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof locationSchema>>({ resolver: zodResolver(locationSchema) })

  const onSubmit = async (data: z.infer<typeof locationSchema>) => {
    setLoading(true)
    try {
      if (modal === 'new') { await createLocation(data); toast.success('Локация добавлена') }
      else if (modal) { await updateLocation(modal.id, data); toast.success('Локация обновлена') }
      setModal(null)
    } catch (err) { toast.error(extractErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить локацию?')) return
    try { await deleteLocation(id); toast.success('Удалено') }
    catch (err) { toast.error(extractErrorMessage(err)) }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { form.reset({ name: '', address: '' }); setModal('new') }}>+ Добавить</Button>
      </div>
      <div className="flex flex-col gap-3">
        {locations.map((l) => (
          <div key={l.id} className="card p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{l.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{l.address}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { form.reset(l); setModal(l) }} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">Изм.</button>
              <button onClick={() => handleDelete(l.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium">Удал.</button>
            </div>
          </div>
        ))}
        {locations.length === 0 && <p className="text-center py-10 text-slate-400 dark:text-slate-600">Нет локаций</p>}
      </div>
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Новая локация' : 'Редактировать локацию'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input label="Название *" error={form.formState.errors.name?.message}    {...form.register('name')} />
          <Input label="Адрес *"    error={form.formState.errors.address?.message} {...form.register('address')} />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" isLoading={loading} className="w-full">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} className="w-full">Отмена</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingTab() {
  const { pricing, createPricing, updatePricing, deletePricing } = useAdminStore()
  const [modal, setModal] = useState<BikePricing | 'new' | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof pricingSchema>>({ resolver: zodResolver(pricingSchema) })

  const onSubmit = async (data: z.infer<typeof pricingSchema>) => {
    setLoading(true)
    try {
      if (modal === 'new') { await createPricing(data); toast.success('Тариф добавлен') }
      else if (modal) { await updatePricing(modal.id, data); toast.success('Тариф обновлён') }
      setModal(null)
    } catch (err) { toast.error(extractErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить тариф?')) return
    try { await deletePricing(id); toast.success('Удалено') }
    catch (err) { toast.error(extractErrorMessage(err)) }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { form.reset(); setModal('new') }}>+ Добавить</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/60 text-left">
              <th className="px-4 py-3 label-muted">Тип</th>
              <th className="px-4 py-3 label-muted">Недели</th>
              <th className="px-4 py-3 label-muted">Цена/нед.</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/40 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name_type}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">ID: {p.type_id}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.min_weeks_count}–{p.max_weeks_count} нед.</td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.amount_weeks.toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => { form.reset(p); setModal(p) }} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">Изм.</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium">Удал.</button>
                  </div>
                </td>
              </tr>
            ))}
            {pricing.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400 dark:text-slate-600">Нет тарифов</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Новый тариф' : 'Редактировать тариф'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input label="Название типа *" error={form.formState.errors.name_type?.message} {...form.register('name_type')} />
          <Input label="Type ID *"       type="number" error={form.formState.errors.type_id?.message} {...form.register('type_id')} />
          <Input label="Мин. недель *"   type="number" {...form.register('min_weeks_count')} />
          <Input label="Макс. недель *"  type="number" {...form.register('max_weeks_count')} />
          <Input label="Цена за неделю (₽) *" type="number" {...form.register('amount_weeks')} />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" isLoading={loading} className="w-full">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} className="w-full">Отмена</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
