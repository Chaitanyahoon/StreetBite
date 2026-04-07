'use client'

import Image from 'next/image'
import { type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Save, Upload, X, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  SETTINGS_CARD_ICONS,
  VENDOR_PREFERENCE_OPTIONS,
  VENDOR_SECURITY_ACTIONS,
  VENDOR_STATUS_OPTIONS,
  type VendorPreferenceState,
  type VendorStatusOption,
} from './settings-helpers'

interface SettingsStatusSwitcherProps {
  status: string
  onStatusChange: (status: string) => void
}

interface ImageUploadFieldProps {
  label: string
  preview: string | null
  accept: string
  wrapperClassName: string
  emptyStateClassName: string
  emptyTitle: string
  emptySubtitle?: string
  changeLabel: string
  removeTitle: string
  overlayIconClassName: string
  overlayLabelClassName: string
  onSelect: (file: File) => void
  onRemove: () => void
}

interface VendorImageUploadsProps {
  bannerPreview: string | null
  displayPreview: string | null
  onBannerSelect: (file: File) => void
  onDisplaySelect: (file: File) => void
  onBannerRemove: () => void
  onDisplayRemove: () => void
}

interface VendorPreferencesCardProps {
  settings: VendorPreferenceState
  onSettingsChange: (settings: VendorPreferenceState) => void
}

interface VendorSaveButtonProps {
  saving: boolean
  onSave: () => void
}

function SettingsCardHeader({
  title,
  gradientClassName,
  borderClassName,
  iconBgClassName,
  iconColorClassName,
  Icon,
}: {
  title: string
  gradientClassName: string
  borderClassName: string
  iconBgClassName: string
  iconColorClassName: string
  Icon: LucideIcon
}) {
  return (
    <CardHeader className={`${gradientClassName} border-b ${borderClassName} py-4 px-6`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBgClassName}`}>
          <Icon className={`w-5 h-5 ${iconColorClassName}`} />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </div>
    </CardHeader>
  )
}

function ImageUploadField({
  label,
  preview,
  accept,
  wrapperClassName,
  emptyStateClassName,
  emptyTitle,
  emptySubtitle,
  changeLabel,
  removeTitle,
  overlayIconClassName,
  overlayLabelClassName,
  onSelect,
  onRemove,
}: ImageUploadFieldProps) {
  return (
    <div className={wrapperClassName}>
      <Label className="text-sm font-medium text-gray-900">{label}</Label>
      <div className="relative">
        <label className="block cursor-pointer group relative">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
            }}
          />
          <div className={emptyStateClassName}>
            {preview ? (
              <>
                <Image src={preview} alt={label} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover absolute inset-0" unoptimized />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Upload className={overlayIconClassName} />
                  <span className={overlayLabelClassName}>{changeLabel}</span>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">{emptyTitle}</p>
                {emptySubtitle ? <p className="text-xs text-muted-foreground">{emptySubtitle}</p> : null}
              </>
            )}
          </div>
        </label>
        {preview ? (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
            title={removeTitle}
          >
            <X className="w-3 h-3" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function SettingsStatusSwitcher({ status, onStatusChange }: SettingsStatusSwitcherProps) {
  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-gray-200">
      {VENDOR_STATUS_OPTIONS.map((option: VendorStatusOption) => {
        const Icon = option.icon

        return (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              status === option.value ? option.activeClassName : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function VendorImageUploads({
  bannerPreview,
  displayPreview,
  onBannerSelect,
  onDisplaySelect,
  onBannerRemove,
  onDisplayRemove,
}: VendorImageUploadsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <ImageUploadField
        label="Logo"
        preview={displayPreview}
        accept="image/*"
        wrapperClassName="space-y-2 flex-shrink-0"
        emptyStateClassName={`w-32 h-32 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-2 overflow-hidden relative ${
          displayPreview ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
        }`}
        emptyTitle="Upload Logo"
        changeLabel="Change"
        removeTitle="Remove logo"
        overlayIconClassName="w-6 h-6 text-white mb-1"
        overlayLabelClassName="text-white font-medium text-xs"
        onSelect={onDisplaySelect}
        onRemove={onDisplayRemove}
      />

      <ImageUploadField
        label="Banner Image"
        preview={bannerPreview}
        accept="image/*"
        wrapperClassName="space-y-2 flex-grow"
        emptyStateClassName={`h-32 w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-4 overflow-hidden relative ${
          bannerPreview ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
        }`}
        emptyTitle="Upload Banner"
        emptySubtitle="1920x1080 recommended"
        changeLabel="Change Banner"
        removeTitle="Remove banner"
        overlayIconClassName="w-8 h-8 text-white mb-2"
        overlayLabelClassName="text-white font-medium text-sm"
        onSelect={onBannerSelect}
        onRemove={onBannerRemove}
      />
    </div>
  )
}

export function VendorPreferencesCard({ settings, onSettingsChange }: VendorPreferencesCardProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <SettingsCardHeader
        title="Preferences"
        gradientClassName="bg-gradient-to-r from-emerald-50 to-white"
        borderClassName="border-emerald-100/50"
        iconBgClassName="bg-emerald-100"
        iconColorClassName="text-emerald-600"
        Icon={SETTINGS_CARD_ICONS.preferences}
      />
      <CardContent className="p-6 space-y-5">
        {VENDOR_PREFERENCE_OPTIONS.map((option, index) => (
          <div key={option.key}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{option.title}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                checked={settings[option.key]}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, [option.key]: checked })}
              />
            </div>
            {index < VENDOR_PREFERENCE_OPTIONS.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function VendorSecurityCard() {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <SettingsCardHeader
        title="Security"
        gradientClassName="bg-gradient-to-r from-gray-50 to-white"
        borderClassName="border-gray-100/50"
        iconBgClassName="bg-gray-100"
        iconColorClassName="text-gray-600"
        Icon={SETTINGS_CARD_ICONS.security}
      />
      <CardContent className="p-6 space-y-3">
        {VENDOR_SECURITY_ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start h-10 text-sm"
            onClick={() => toast.info(action.toastMessage)}
          >
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export function VendorSaveButton({ saving, onSave }: VendorSaveButtonProps) {
  return (
    <div className="sticky bottom-4 md:static">
      <Button
        onClick={onSave}
        disabled={saving}
        className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  )
}
