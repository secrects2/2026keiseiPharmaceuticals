// 這個檔案包含要加入到課程詳情頁面的程式碼片段

// 1. 加入 fetchProductBundles 函數（在 fetchUserCoins 之後）
const fetchProductBundles = async () => {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('product_bundles')
      .select('*')
      .eq('course_id', params.id)
      .eq('is_active', true)
      .order('bundle_type', { ascending: true })

    if (error) throw error

    setProductBundles(data || [])
  } catch (error) {
    console.error('Error fetching product bundles:', error)
  }
}

// 2. 在 JSX 中加入產品包展示（在課程資訊卡片之後，報名表單之前）
{productBundles.length > 0 && (
  <ProductBundleSection
    bundles={productBundles}
    onSelectBundle={(bundle) => {
      setSelectedBundle(bundle)
      // 可以在這裡處理產品包選擇邏輯
      console.log('Selected bundle:', bundle)
    }}
  />
)}
