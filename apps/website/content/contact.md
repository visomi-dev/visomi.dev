---
title: 'Contact'
description: 'Get in touch with Michael Villalba for software engineering opportunities, collaborations, or technical consultations.'
url: /contact/
---

<section class="pt-24 pb-12 px-4 min-h-screen flex items-center">
  <div class="max-w-2xl mx-auto w-full">
    
    <!-- Header -->
    <div class="text-center mb-12">
      <span class="font-mono text-sm text-gray-500">{{ i18n "contactPageLabel" }}</span>
      <h1 class="text-4xl md:text-5xl font-bold mt-4 mb-6">{{ i18n "contactPageTitle" }}</h1>
      <p class="text-gray-400 max-w-lg mx-auto">{{ i18n "contactHeroDescription" }}</p>
      
      <div class="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-green-400 text-sm">{{ i18n "contactHeroStatus" }}</span>
      </div>
    </div>
    
    <!-- Contact Form -->
    <form class="space-y-6" id="contact-form">
      <!-- Identity -->
      <div>
        <label for="identity" class="block text-sm text-gray-400 mb-2">{{ i18n "contactFormLabelIdentity" }}</label>
        <input 
          type="text" 
          id="identity" 
          name="identity"
          placeholder="{{ i18n "contactFormPlaceholderIdentity" }}"
          required
          class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        >
      </div>
      
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm text-gray-400 mb-2">{{ i18n "contactFormLabelEmail" }}</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          placeholder="{{ i18n "contactFormPlaceholderEmail" }}"
          required
          class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        >
      </div>
      
      <!-- Protocol (Select) -->
      <div>
        <label for="protocol" class="block text-sm text-gray-400 mb-2">{{ i18n "contactFormLabelProtocol" }}</label>
        <select 
          id="protocol" 
          name="protocol"
          required
          class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled selected>Select an option</option>
          <option value="consulting">{{ i18n "contactFormOptionConsulting" }}</option>
          <option value="speaking">{{ i18n "contactFormOptionSpeaking" }}</option>
          <option value="fulltime">{{ i18n "contactFormOptionFulltime" }}</option>
          <option value="other">{{ i18n "contactFormOptionOther" }}</option>
        </select>
      </div>
      
      <!-- Payload (Message) -->
      <div>
        <label for="payload" class="block text-sm text-gray-400 mb-2">{{ i18n "contactFormLabelPayload" }}</label>
        <textarea 
          id="payload" 
          name="payload"
          rows="5"
          placeholder="{{ i18n "contactFormPlaceholderPayload" }}"
          required
          class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
        ></textarea>
      </div>
      
      <!-- Submit -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <button 
          type="submit"
          class="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors w-full md:w-auto"
        >
          {{ i18n "contactFormButtonTransmit" }}
        </button>
        
        <span class="font-mono text-xs text-gray-600 flex items-center gap-2">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          {{ i18n "contactFormSecurityMsg" }}
        </span>
      </div>
    </form>
    
  </div>
</section>

<script>
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  
  // In production, this would send to an API endpoint
  // For now, we'll show an alert
  alert('Thank you for your message! This is a demo form. In production, this would send data to an endpoint.');
  this.reset();
});
</script>
