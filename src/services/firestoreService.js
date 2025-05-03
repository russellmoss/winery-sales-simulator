export const getScenarios = async () => {
  try {
    console.log('🔍 [getScenarios] Starting scenario fetch...');
    if (!auth.currentUser) {
      console.error('❌ [getScenarios] User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('✅ [getScenarios] User authenticated:', auth.currentUser.uid);
    const scenariosRef = collection(db, 'scenarios');
    console.log('📂 [getScenarios] Collection reference created:', scenariosRef.path);

    const snapshot = await getDocs(scenariosRef);
    console.log('📊 [getScenarios] Snapshot received:', {
      empty: snapshot.empty,
      size: snapshot.size,
      docs: snapshot.docs.map(doc => ({
        id: doc.id,
        exists: doc.exists(),
        data: doc.data()
      }))
    });
    
    if (snapshot.empty) {
      console.log('⚠️ [getScenarios] No scenarios found, returning default scenarios');
      return defaultScenarios;
    }

    const scenarios = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📝 [getScenarios] Processing scenario ${doc.id}:`, {
        id: doc.id,
        exists: doc.exists(),
        data: data
      });
      scenarios.push({
        id: doc.id,
        ...data
      });
    });

    console.log('✅ [getScenarios] Successfully processed all scenarios:', scenarios);
    return scenarios;
  } catch (error) {
    console.error('❌ [getScenarios] Error fetching scenarios:', error);
    throw error;
  }
};

export const getScenarioById = async (scenarioId) => {
  try {
    console.log(`🔍 [getScenarioById] Starting fetch for scenario ${scenarioId}...`);
    if (!auth.currentUser) {
      console.error('❌ [getScenarioById] User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('✅ [getScenarioById] User authenticated:', auth.currentUser.uid);
    const scenarioRef = doc(db, 'scenarios', scenarioId);
    console.log('📂 [getScenarioById] Document reference created:', scenarioRef.path);

    const scenarioDoc = await getDoc(scenarioRef);
    console.log(`📊 [getScenarioById] Document snapshot for ${scenarioId}:`, {
      exists: scenarioDoc.exists(),
      id: scenarioDoc.id,
      data: scenarioDoc.data()
    });

    if (!scenarioDoc.exists()) {
      console.error(`❌ [getScenarioById] Scenario not found with ID: ${scenarioId}`);
      throw new Error('Scenario not found');
    }

    const scenarioData = {
      id: scenarioDoc.id,
      ...scenarioDoc.data()
    };
    console.log(`✅ [getScenarioById] Successfully fetched scenario ${scenarioId}:`, scenarioData);
    return scenarioData;
  } catch (error) {
    console.error(`❌ [getScenarioById] Error fetching scenario ${scenarioId}:`, error);
    throw error;
  }
}; 