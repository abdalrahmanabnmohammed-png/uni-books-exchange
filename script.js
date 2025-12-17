// إعدادات Supabase - ضع بياناتك هنا
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let activeReceiverId = null;

// تشغيل عند تحميل الصفحة
window.onload = async () => {
    checkUser();
    loadBooks();
};

async function checkUser() {
    const { data } = await _supabase.auth.getUser();
    if (data?.user) {
        currentUser = data.user;
        document.getElementById('loginBtnNav').innerText = "خروج";
        document.getElementById('loginBtnNav').onclick = () => _supabase.auth.signOut().then(() => location.reload());
    }
}

// وظائف تسجيل الدخول
async function handleAuth() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passInput').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) { // إذا لم يجد حساب، ينشئ حساب جديد
        const { error: signUpErr } = await _supabase.auth.signUp({ email, password });
        if (signUpErr) alert(signUpErr.message);
        else alert("تم إنشاء الحساب! تحقق من إيميلك.");
    } else {
        location.reload();
    }
}

// تحميل الكتب
async function loadBooks() {
    const { data: books, error } = await _supabase.from('books').select('*');
    if (books) renderBooks(books);
}

function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = books.map(book => `
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 book-card">
            <img src="${book.image_url || 'https://via.placeholder.com/300'}" class="w-full h-48 object-cover">
            <div class="p-5">
                <span class="text-xs font-bold text-blue-500 uppercase">${book.college || 'عام'}</span>
                <h4 class="font-bold text-lg mt-1">${book.title}</h4>
                <p class="text-gray-500 text-sm mb-4">${book.university}</p>
                <div class="flex justify-between items-center">
                    <span class="text-green-600 font-bold">${book.price} ريال</span>
                    <button onclick="openChat('${book.seller_id}', '${book.title}')" class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition">مراسلة</button>
                </div>
            </div>
        </div>
    `).join('');
}

// نظام الدردشة
async function openChat(sellerId, title) {
    if (!currentUser) { toggleModal('loginModal'); return; }
    if (currentUser.id === sellerId) { alert("هذا كتابك!"); return; }

    activeReceiverId = sellerId;
    document.getElementById('chatTitle').innerText = title;
    document.getElementById('chatBox').classList.remove('hidden');
    
    fetchMessages();
    // تفعيل التحديث اللحظي
    _supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public' }, fetchMessages).subscribe();
}

async function sendChatMessage() {
    const input = document.getElementById('msgInput');
    if (!input.value) return;

    await _supabase.from('messages').insert([
        { sender_id: currentUser.id, receiver_id: activeReceiverId, content: input.value }
    ]);
    input.value = '';
}

async function fetchMessages() {
    const { data: msgs } = await _supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeReceiverId}),and(sender_id.eq.${activeReceiverId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

    const container = document.getElementById('msgContainer');
    container.innerHTML = msgs.map(m => `
        <div class="max-w-[80%] p-2 rounded-lg ${m.sender_id === currentUser.id ? 'bg-blue-600 text-white self-end' : 'bg-white border self-start'}">
            ${m.content}
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
function toggleChat() { document.getElementById('chatBox').classList.toggle('hidden'); }
