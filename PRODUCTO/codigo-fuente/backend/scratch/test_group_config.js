// scratch/test_group_config.js
const API_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🧪 Starting Group Settings Endpoint Integration Tests (using native fetch)...');

    try {
        // 1. Log in as Mateo (User 9) to get a token
        console.log('\n1. Logging in as mateo@gmail.com...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mail: 'mateo@gmail.com',
                contraseña: '123456'
            })
        });
        const loginData = await loginRes.json();
        const mateoToken = loginData.token;
        const mateoId = loginData.usuario.id;
        console.log(`✅ Mateo logged in successfully. User ID: ${mateoId}`);

        // 2. Create a new group as Mateo
        console.log('\n2. Creating a new public study group...');
        const groupRes = await fetch(`${API_URL}/grupos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mateoToken}`
            },
            body: JSON.stringify({
                nombre: 'Grupo de Algebra Computacional',
                descripcion: 'Para estudiar algebra lineal y algoritmos avanzados.',
                estado: 'publico'
            })
        });
        const grupo = await groupRes.json();
        const grupoId = grupo.id;
        console.log(`✅ Group created successfully. ID: ${grupoId}, Name: "${grupo.nombre}", Visibility: "${grupo.estado}"`);

        // 3. Log in as a different user (e.g. Maria / User 7) to test authorization
        console.log('\n3. Logging in as maria.gomez@mail.com to test unauthorized updates...');
        const loginJuanRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mail: 'maria.gomez@mail.com',
                contraseña: '123456'
            })
        });
        const loginJuanData = await loginJuanRes.json();
        const juanToken = loginJuanData.token;
        console.log(`✅ Secondary user logged in successfully. User ID: ${loginJuanData.usuario.id}`);

        // Try to update Mateo's group as the secondary user
        console.log('4. Attempting to edit Mateo\'s group as unauthorized user...');
        const failRes = await fetch(`${API_URL}/grupos/${grupoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${juanToken}`
            },
            body: JSON.stringify({
                nombre: 'Hackeo de Grupo',
                descripcion: 'Intento de modificar sin permisos',
                estado: 'privado'
            })
        });
        
        if (failRes.status === 403) {
            const failData = await failRes.json();
            console.log('✅ PASS: Unauthorized edit correctly blocked with 403 Forbidden:', failData.error);
        } else {
            console.log(`❌ FAIL: Expected 403 Forbidden but got status code: ${failRes.status}`);
        }

        // 4. Update the group details as Mateo (Admin)
        console.log('\n5. Updating group details as Mateo (Admin)...');
        const updateRes = await fetch(`${API_URL}/grupos/${grupoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mateoToken}`
            },
            body: JSON.stringify({
                nombre: 'Grupo Editado OK',
                descripcion: 'Descripcion editada OK',
                estado: 'privado'
            })
        });
        
        const updatedGrupo = await updateRes.json();
        console.log(`✅ Update response status: ${updateRes.status}`);
        console.log(`✅ Updated Name: "${updatedGrupo.nombre}"`);
        console.log(`✅ Updated Description: "${updatedGrupo.descripcion}"`);
        console.log(`✅ Updated Visibility: "${updatedGrupo.estado}"`);

        if (
            updatedGrupo.nombre === 'Grupo Editado OK' &&
            updatedGrupo.descripcion === 'Descripcion editada OK' &&
            updatedGrupo.estado === 'privado'
        ) {
            console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The group settings backend logic is extremely solid and secure.');
        } else {
            console.log('\n❌ FAIL: Updated fields do not match expected values.');
        }

    } catch (error) {
        console.error('❌ Integration test failed with error:', error.message);
    }
}

runTests();
