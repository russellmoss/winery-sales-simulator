const loadScenario = async (scenarioId) => {
  try {
    console.log(`🔍 [loadScenario] Starting to load scenario ${scenarioId}...`);
    setLoading(true);
    setError(null);

    console.log('📊 [loadScenario] Current state:', {
      currentScenario: currentScenario,
      loading: loading,
      error: error
    });

    const scenario = await getScenarioById(scenarioId);
    console.log(`✅ [loadScenario] Successfully loaded scenario ${scenarioId}:`, scenario);

    setCurrentScenario(scenario);
    setLoading(false);
    console.log('✅ [loadScenario] Scenario state updated successfully');
  } catch (err) {
    console.error(`❌ [loadScenario] Error loading scenario ${scenarioId}:`, err);
    setError(err.message);
    setLoading(false);
    console.log('❌ [loadScenario] Error state updated');
  }
}; 