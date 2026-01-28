import{v as o}from"./googleMapsValidation.ClWfp510.js";document.querySelectorAll(".test-scenario").forEach(d=>{d.addEventListener("click",async l=>{const a=l.currentTarget,n=parseFloat(a.dataset.lat||"0"),s=parseFloat(a.dataset.lng||"0"),e=a.dataset.name||"",r=a.dataset.type||"";await i(n,s,e,r)})});document.getElementById("manual-test-form")?.addEventListener("submit",async d=>{d.preventDefault();const l=parseFloat(document.getElementById("manual-lat").value),a=parseFloat(document.getElementById("manual-lng").value),n=document.getElementById("manual-name").value,s=document.getElementById("manual-type").value;if(isNaN(l)||isNaN(a)){alert("Please enter valid coordinates");return}await i(l,a,n,s)});async function i(d,l,a,n){const s=document.getElementById("validation-results");if(s){s.innerHTML=`
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div class="animate-spin text-4xl mb-3">⏳</div>
        <div class="font-bold text-gray-900">Validating with Google Maps...</div>
        <div class="text-sm text-gray-600 mt-1">This may take a few seconds</div>
      </div>
    `;try{const e=await o({coordinates:{lat:d,lng:l},name:a||void 0,type:n||void 0},{strictMode:!1,maxDistanceMeters:100,requireGoogleMatch:!1}),r=e.isValid?e.confidence>=.8?"green":"yellow":"red";s.innerHTML=`
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Validation Results</h2>
          
          <div class="bg-${r}-50 border border-${r}-200 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-${r}-900">
                ${e.isValid?"✅ Valid":"❌ Invalid"}
              </span>
              <div class="text-right">
                <div class="text-sm font-medium text-${r}-900">
                  Confidence: ${Math.round(e.confidence*100)}%
                </div>
                ${e.matchScore>0?`
                  <div class="text-sm text-${r}-700">
                    Match: ${Math.round(e.matchScore)}%
                  </div>
                `:""}
              </div>
            </div>
            ${e.distanceFromInput>0?`
              <div class="text-sm mt-2 text-${r}-800">
                📍 Distance: ${Math.round(e.distanceFromInput)}m
              </div>
            `:""}
          </div>

          ${e.placeDetails?`
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 class="font-bold text-blue-900 mb-2">📍 Google Maps Match</h3>
              <div class="space-y-1 text-sm text-blue-800">
                <div><strong>Name:</strong> ${e.placeDetails.name}</div>
                <div><strong>Address:</strong> ${e.placeDetails.formatted_address}</div>
                <div><strong>Coordinates:</strong> ${e.placeDetails.geometry.location.lat.toFixed(6)}, ${e.placeDetails.geometry.location.lng.toFixed(6)}</div>
                ${e.placeDetails.rating?`<div><strong>Rating:</strong> ⭐ ${e.placeDetails.rating}/5</div>`:""}
                ${e.placeDetails.types?`<div><strong>Types:</strong> ${e.placeDetails.types.slice(0,3).join(", ")}</div>`:""}
              </div>
            </div>
          `:""}

          ${e.issues.length>0?`
            <div class="space-y-2 mb-4">
              <h3 class="font-bold text-gray-900">Issues Found:</h3>
              ${e.issues.map(t=>`
                <div class="bg-${t.severity==="error"?"red":t.severity==="warning"?"yellow":"blue"}-100 border border-${t.severity==="error"?"red":t.severity==="warning"?"yellow":"blue"}-200 rounded-lg p-3">
                  <div class="font-medium text-${t.severity==="error"?"red":t.severity==="warning"?"yellow":"blue"}-900">
                    ${t.severity==="error"?"❌":t.severity==="warning"?"⚠️":"ℹ️"} ${t.field}
                  </div>
                  <div class="text-sm text-${t.severity==="error"?"red":t.severity==="warning"?"yellow":"blue"}-800">
                    ${t.message}
                  </div>
                </div>
              `).join("")}
            </div>
          `:""}

          ${e.suggestions.length>0?`
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 class="font-bold text-blue-900 mb-2">💡 Suggestions:</h3>
              <ul class="list-disc list-inside space-y-1 text-sm text-blue-800">
                ${e.suggestions.map(t=>`<li>${t}</li>`).join("")}
              </ul>
            </div>
          `:""}

          <div class="mt-4 pt-4 border-t border-gray-200">
            <pre class="bg-gray-50 rounded p-3 text-xs overflow-auto">${JSON.stringify(e,null,2)}</pre>
          </div>
        </div>
      `}catch(e){s.innerHTML=`
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 class="text-xl font-bold text-red-900 mb-2">❌ Validation Error</h2>
          <p class="text-red-700">${e instanceof Error?e.message:"Unknown error"}</p>
        </div>
      `}}}
