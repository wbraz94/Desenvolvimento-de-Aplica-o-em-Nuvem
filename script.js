// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
const SUPABASE_URL = 'https://ulngxpacigddwzaimhxd.supabase.co';  
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbmd4cGFjaWdkZHd6YWltaHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODczNDUsImV4cCI6MjA5NzQ2MzM0NX0.l1NAsX5ZtVnyPQQaJJtdk8yzRzAx6q8nLNkL0YZcSDU';    

// ============================================
// INICIALIZAÇÃO DO CLIENTE SUPABASE
// ============================================
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let isEditing = false;
let currentContactId = null;

// ============================================
// ELEMENTOS DOM
// ============================================
const elements = {
    // Formulário
    formContainer: document.getElementById('formContainer'),
    formTitle: document.getElementById('formTitle'),
    contactForm: document.getElementById('contactForm'),
    contactId: document.getElementById('contactId'),
    nome: document.getElementById('nome'),
    telefone: document.getElementById('telefone'),
    email: document.getElementById('email'),
    obs: document.getElementById('obs'),
    saveBtn: document.getElementById('saveBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    
    // Tabela
    contactsBody: document.getElementById('contactsBody'),
    totalContatos: document.getElementById('totalContatos'),
    emptyMessage: document.getElementById('emptyMessage'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    tableWrapper: document.getElementById('tableWrapper'),
    
    // Busca
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    
    // Botões
    newContactBtn: document.getElementById('newContactBtn'),
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

// 1. Carregar todos os contatos
async function loadContacts(searchTerm = '') {
    try {
        showLoading(true);
        
        let query = supabaseClient
            .from('contato')
            .select('*')
            .order('id', { ascending: true });
        
        // Se houver termo de busca, filtrar
        if (searchTerm) {
            query = query.ilike('nome', `%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        renderContacts(data || []);
        updateTotalCount(data?.length || 0);
        
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        showNotification('Erro ao carregar contatos: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 2. Renderizar contatos na tabela
function renderContacts(contacts) {
    const tbody = elements.contactsBody;
    
    if (!contacts || contacts.length === 0) {
        tbody.innerHTML = '';
        elements.emptyMessage.style.display = 'block';
        elements.tableWrapper.style.display = 'none';
        return;
    }
    
    elements.emptyMessage.style.display = 'none';
    elements.tableWrapper.style.display = 'block';
    
    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td><strong>#${contact.id}</strong></td>
            <td><strong>${escapeHtml(contact.nome)}</strong></td>
            <td>${contact.telefone ? escapeHtml(contact.telefone) : '-'}</td>
            <td>${contact.email ? escapeHtml(contact.email) : '-'}</td>
            <td>${formatDate(contact.dtcontato)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editContact(${contact.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteContact(${contact.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 3. Salvar contato (criar ou atualizar)
async function saveContact(event) {
    event.preventDefault();
    
    const nome = elements.nome.value.trim();
    const telefone = elements.telefone.value.trim();
    const email = elements.email.value.trim();
    const obs = elements.obs.value.trim();
    
    // Validação básica
    if (!nome) {
        showNotification('O campo Nome é obrigatório!', 'warning');
        elements.nome.focus();
        return;
    }
    
    try {
        const contactData = { nome, telefone, email, obs };
        
        if (isEditing && currentContactId) {
            // UPDATE - Atualizar contato existente
            const { data, error } = await supabaseClient
                .from('contato')
                .update(contactData)
                .eq('id', currentContactId)
                .select();
            
            if (error) throw error;
            
            showNotification('Contato atualizado com sucesso!', 'success');
        } else {
            // INSERT - Criar novo contato
            const { data, error } = await supabaseClient
                .from('contato')
                .insert([contactData])
                .select();
            
            if (error) throw error;
            
            showNotification('Contato criado com sucesso!', 'success');
        }
        
        // Resetar formulário e recarregar lista
        resetForm();
        await loadContacts();
        
    } catch (error) {
        console.error('Erro ao salvar contato:', error);
        showNotification('Erro ao salvar contato: ' + error.message, 'error');
    }
}

// 4. Editar contato
async function editContact(id) {
    try {
        const { data, error } = await supabaseClient
            .from('contato')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (data) {
            // Preencher formulário
            elements.contactId.value = data.id;
            elements.nome.value = data.nome;
            elements.telefone.value = data.telefone || '';
            elements.email.value = data.email || '';
            elements.obs.value = data.obs || '';
            
            isEditing = true;
            currentContactId = data.id;
            
            elements.formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Contato';
            elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar';
            
            // Mostrar formulário
            elements.formContainer.classList.remove('hidden');
            elements.formContainer.scrollIntoView({ behavior: 'smooth' });
            
            elements.nome.focus();
        }
        
    } catch (error) {
        console.error('Erro ao carregar contato para edição:', error);
        showNotification('Erro ao carregar contato: ' + error.message, 'error');
    }
}

// 5. Excluir contato
async function deleteContact(id) {
    // Confirmar exclusão
    const confirmDelete = confirm(`Tem certeza que deseja excluir o contato #${id}?`);
    if (!confirmDelete) return;
    
    try {
        const { error } = await supabaseClient
            .from('contato')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Contato excluído com sucesso!', 'success');
        
        // Se estiver editando o contato que foi excluído, resetar formulário
        if (isEditing && currentContactId === id) {
            resetForm();
        }
        
        await loadContacts();
        
    } catch (error) {
        console.error('Erro ao excluir contato:', error);
        showNotification('Erro ao excluir contato: ' + error.message, 'error');
    }
}

// 6. Buscar contatos
function searchContacts() {
    const searchTerm = elements.searchInput.value.trim();
    loadContacts(searchTerm);
}

// 7. Limpar busca
function clearSearch() {
    elements.searchInput.value = '';
    loadContacts('');
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Resetar formulário
function resetForm() {
    elements.contactForm.reset();
    elements.contactId.value = '';
    isEditing = false;
    currentContactId = null;
    elements.formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Novo Contato';
    elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
    elements.formContainer.classList.add('hidden');
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('hidden');
        elements.tableWrapper.style.display = 'none';
    } else {
        elements.loadingSpinner.classList.add('hidden');
    }
}

// Atualizar contador de contatos
function updateTotalCount(count) {
    elements.totalContatos.textContent = `${count} ${count === 1 ? 'contato' : 'contatos'}`;
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Estilizar notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '400px',
    });
    
    // Cores por tipo
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Ícone da notificação
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ============================================
// EVENT LISTENERS
// ============================================

// Salvar contato
elements.contactForm.addEventListener('submit', saveContact);

// Cancelar edição/criação
elements.cancelBtn.addEventListener('click', resetForm);

// Novo contato
elements.newContactBtn.addEventListener('click', () => {
    resetForm();
    elements.formContainer.classList.remove('hidden');
    elements.formContainer.scrollIntoView({ behavior: 'smooth' });
    elements.nome.focus();
});

// Buscar
elements.searchBtn.addEventListener('click', searchContacts);
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchContacts();
    }
});
elements.clearSearchBtn.addEventListener('click', clearSearch);

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

// Carregar contatos ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    console.log('📱 Agenda Digital iniciada com sucesso!');
    console.log('🔗 Conectada ao Supabase:', SUPABASE_URL);
});

// Testar conexão com Supabase
async function testConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('contato')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão com Supabase:', error);
        showNotification('Erro de conexão com o banco de dados!', 'error');
        return false;
    }
}

// Executar teste de conexão
testConnection();

// ============================================
// EXPORTAÇÃO PARA USO GLOBAL
// ============================================
window.editContact = editContact;
window.deleteContact = deleteContact;
window.loadContacts = loadContacts;
window.saveContact = saveContact;
window.resetForm = resetForm;
window.searchContacts = searchContacts;
window.clearSearch = clearSearch;

console.log('🚀 Aplicação pronta para uso!');