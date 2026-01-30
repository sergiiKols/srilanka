// Проверка последних действий и ошибок
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://mcmzdscpuoxwneuzsanu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw'
);

async function checkSessionError() {
    console.log('🔍 Проверка последних действий...\n');
    
    // Проверяем последние добавленные объекты
    const { data: recent, error } = await supabase
        .from('saved_properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('❌ Ошибка:', error);
        return;
    }
    
    console.log(`📊 Последние объекты (${recent?.length || 0}):\n`);
    
    if (recent && recent.length > 0) {
        recent.forEach((obj, i) => {
            const createdAgo = Math.round((Date.now() - new Date(obj.created_at).getTime()) / 1000);
            console.log(`${i + 1}. ID: ${obj.id.substring(0, 8)}...`);
            console.log(`   Title: ${obj.title || 'N/A'}`);
            console.log(`   User: ${obj.telegram_user_id}`);
            console.log(`   Photos: ${obj.photos ? (Array.isArray(obj.photos) ? obj.photos.length : '1') : '0'}`);
            console.log(`   Location: ${obj.latitude ? `${obj.latitude}, ${obj.longitude}` : 'N/A'}`);
            console.log(`   Created: ${createdAgo}s ago`);
            console.log('   ---');
        });
    } else {
        console.log('❌ Нет объектов в базе');
    }
    
    // Проверяем всех пользователей
    const { data: users } = await supabase
        .from('tenants')
        .select('telegram_user_id, saved_properties_count, created_at')
        .order('created_at', { ascending: false });
    
    console.log(`\n👥 Пользователи (${users?.length || 0}):\n`);
    if (users) {
        users.forEach(u => {
            console.log(`  User ${u.telegram_user_id}: ${u.saved_properties_count} объектов`);
        });
    }
}

checkSessionError();
