// إعدادات Supabase (سنضع المفاتيح لاحقاً)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// وظيفة فتح وإغلاق النوافذ
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle('hidden');
    modal.classList.toggle('modal-active');
}

// وظيفة التحقق قبل القيام بعمل (مثل المراسلة أو الإضافة)
function checkAuthForAction() {
    const user = supabase.auth.user();
    if (!user) {
        alert("عذراً، يجب عليك تسجيل الدخول برقم الهاتف لتتمكن من القيام بهذا الإجراء.");
        toggleModal('loginModal');
    } else {
        // توجيه لصفحة إضافة الكتاب أو فتح الدردشة
        console.log("المستخدم مسجل دخول");
    }
}

// عرض كتب تجريبية (للتوضيح فقط)
const dummyBooks = [
    { title: "أساسيات البرمجة", univ: "جامعة الملك سعود", price: 40, img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=400" },
    { title: "كيمياء 101", univ: "جامعة القاهرة", price: 25, img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400" },
    { title: "محاسبة مالية", univ: "جامعة عفت", price: 60, img: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400" }
];

function displayBooks() {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = dummyBooks.map(book => `
        <div class="bg-white rounded-2xl book-card overflow-hidden shadow-sm border border-gray-100">
            <img src="${book.img}" class="w-full h-48 object-cover">
            <div class="p-5">
                <h4 class="font-bold text-lg mb-1">${book.title}</h4>
                <p class="text-gray-500 text-sm mb-4">${book.univ}</p>
                <div class="flex justify-between items-center">
                    <span class="text-blue-600 font-bold">${book.price} ريال</span>
                    <button onclick="checkAuthForAction()" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">تواصل</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.onload = displayBooks;
