<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <h2 class="text-xl font-bold">🤖 Trợ lý AI</h2>
        <button @click="closeAssistant" class="text-xl leading-none hover:opacity-80">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <p class="text-gray-700 mb-6">
          Xin chào! 👋 Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn:
        </p>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 gap-3 mb-6">
          <button
            @click="selectAction('recommendations')"
            class="text-left p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <p class="font-semibold text-blue-600">🍽️ Đề xuất món ăn</p>
            <p class="text-sm text-gray-600">Tìm kiếm món ăn phù hợp với sở thích của bạn</p>
          </button>

          <button
            @click="selectAction('diet')"
            class="text-left p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <p class="font-semibold text-blue-600">🥗 Chế độ ăn kiêng</p>
            <p class="text-sm text-gray-600">Lọc thực phẩm theo yêu cầu sức khỏe</p>
          </button>

          <button
            @click="selectAction('popular')"
            class="text-left p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <p class="font-semibold text-blue-600">⭐ Món được yêu thích</p>
            <p class="text-sm text-gray-600">Xem các món ăn được đánh giá cao nhất</p>
          </button>

          <button
            @click="selectAction('budget')"
            class="text-left p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <p class="font-semibold text-blue-600">💰 Theo ngân sách</p>
            <p class="text-sm text-gray-600">Tìm món ăn trong tầm giá của bạn</p>
          </button>
        </div>

        <!-- Chat Input -->
        <div class="border-t pt-4">
          <label class="block text-sm font-semibold mb-2">Hoặc mô tả sở thích của bạn:</label>
          <div class="flex gap-2">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              placeholder="Ví dụ: Tôi muốn ăn gà nướng..."
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              @click="sendMessage"
              :disabled="!userInput.trim()"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Gửi
            </button>
          </div>
        </div>

        <!-- Results -->
        <div v-if="results.length > 0" class="mt-6 border-t pt-4">
          <p class="font-semibold mb-3">💡 Đề xuất của tôi:</p>
          <div class="space-y-2">
            <button
              v-for="item in results"
              :key="item.id"
              @click="selectFood(item)"
              class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <p class="font-semibold text-blue-600">{{ item.name }}</p>
              <p class="text-xs text-gray-600 line-clamp-1">{{ item.description }}</p>
              <p class="text-sm font-bold text-green-600 mt-1">{{ formatPrice(item.price) }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t bg-gray-50 p-4 flex gap-3">
        <button
          @click="closeAssistant"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  foods: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select-food'])

const userInput = ref('')
const results = ref([])
const selectedAction = ref('')

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const closeAssistant = () => {
  userInput.value = ''
  results.value = []
  selectedAction.value = ''
  emit('close')
}

const selectAction = (action) => {
  selectedAction.value = action
  results.value = []

  // Simulate AI recommendations based on action
  if (props.foods && props.foods.length > 0) {
    switch (action) {
      case 'recommendations':
        results.value = props.foods.slice(0, 3)
        break
      case 'popular':
        results.value = props.foods
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3)
        break
      case 'budget':
        results.value = props.foods
          .sort((a, b) => a.price - b.price)
          .slice(0, 3)
        break
      case 'diet':
        results.value = props.foods.filter(f => f.is_vegetarian).slice(0, 3)
        break
    }
  }
}

const sendMessage = () => {
  if (!userInput.value.trim()) return

  // Simulate AI search
  const query = userInput.value.toLowerCase()
  results.value = props.foods
    .filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query)
    )
    .slice(0, 5)

  if (results.value.length === 0) {
    alert('Không tìm thấy món ăn phù hợp. Vui lòng thử từ khác.')
  }

  userInput.value = ''
}

const selectFood = (food) => {
  emit('select-food', food)
  closeAssistant()
}
</script>
