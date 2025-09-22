<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">Send Invitations</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <p class="text-gray-600">
          You have <strong>{{ availableInvitations }}</strong>
          {{ availableInvitations === 1 ? 'invitation' : 'invitations' }} available to send.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="friend@example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="sending"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Personal Message (Optional)
          </label>
          <textarea
            v-model="message"
            rows="3"
            placeholder="Hey! I found this great app for finding clean bathrooms..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            :disabled="sending"
          ></textarea>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-medium text-blue-800 mb-2">How invitations work:</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• Your friend will receive an email with a special link</li>
            <li>• They can sign in with any Google account when clicking the link</li>
            <li>• The invitation doesn't lock them to a specific email address</li>
            <li>• You'll get more invitations as you add reviews!</li>
          </ul>
        </div>

        <div class="flex space-x-3 pt-4">
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            :disabled="sending"
          >
            Cancel
          </button>
          <button
            @click="sendInvitation"
            :disabled="!email || sending || availableInvitations === 0"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium"
          >
            {{ sending ? 'Sending...' : 'Send Invitation' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

interface Props {
  availableInvitations: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  sent: []
}>()

const toast = useToast()
const authStore = useAuthStore()

const email = ref('')
const message = ref('')
const sending = ref(false)

const sendInvitation = async () => {
  if (!email.value || !authStore.user) return

  sending.value = true
  try {
    // Generate access code
    const { data: accessCode, error: codeError } = await supabase
      .rpc('generate_access_code')

    if (codeError || !accessCode) {
      throw new Error('Failed to generate access code')
    }

    // Create invitation record
    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        access_code: accessCode,
        created_by: authStore.user.id,
        sent_to_email: email.value
      })

    if (inviteError) {
      throw inviteError
    }

    // Send email via Mailgun
    await sendInvitationEmail(email.value, accessCode, message.value)

    // Update user's pending invitation count
    await supabase
      .from('users')
      .update({ pending_invitations: props.availableInvitations - 1 })
      .eq('id', authStore.user.id)

    emit('sent')
    emit('close')
  } catch (error) {
    console.error('Error sending invitation:', error)
    toast.error('Failed to send invitation')
  } finally {
    sending.value = false
  }
}

const sendInvitationEmail = async (toEmail: string, accessCode: string, personalMessage: string) => {
  // TODO: Implement Mailgun email sending
  const inviteUrl = `${window.location.origin}/invite/${accessCode}`

  console.log('Would send invitation email to:', toEmail)
  console.log('Invite URL:', inviteUrl)
  console.log('Personal message:', personalMessage)

  // For now, just copy to clipboard
  await navigator.clipboard.writeText(inviteUrl)
  toast.info(`Invitation link copied to clipboard! Share it with ${toEmail}`)
}
</script>