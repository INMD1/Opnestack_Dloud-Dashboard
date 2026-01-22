// 데이터베이스 초기화 스크립트
import { createClient } from '@libsql/client';

const client = createClient({
    url: 'file:./sqlite.db',
});

// 데이터베이스 연결 테스트
async function initializeDatabase() {
    try {
        // 간단한 쿼리로 연결 테스트
        const result = await client.execute('SELECT 1 as test');
        console.log('✅ 데이터베이스 연결 성공!');
        console.log('데이터베이스 파일: sqlite.db');
        console.log('연결 테스트 결과:', result.rows);
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

initializeDatabase();
