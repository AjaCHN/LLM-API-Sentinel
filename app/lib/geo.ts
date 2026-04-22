// app/lib/geo.ts v1.0.0

interface GeoInfo {
  city: string;
  country: string;
  ip?: string;
}

export const getGeoInfo = async (): Promise<GeoInfo> => {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // 检查本地存储是否有缓存的地理位置信息
    const cachedGeo = localStorage.getItem('geoInfo');
    if (cachedGeo) {
      try {
        return JSON.parse(cachedGeo);
      } catch (error) {
        console.error('Failed to parse cached geo info:', error);
      }
    }

    // 只有当没有缓存时才请求
    if (!cachedGeo) {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const geoData: GeoInfo = { city: data.city, country: data.country_name, ip: data.ip };
        
        // 缓存地理位置信息，有效期24小时
        localStorage.setItem('geoInfo', JSON.stringify(geoData));
        localStorage.setItem('geoInfoExpiry', String(Date.now() + 24 * 60 * 60 * 1000));
        
        return geoData;
      } catch (error) {
        console.error('Failed to get geo info:', error);
        return { city: 'Unknown', country: 'Global' };
      }
    } else {
      // 检查缓存是否过期
      const expiry = localStorage.getItem('geoInfoExpiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        localStorage.removeItem('geoInfo');
        localStorage.removeItem('geoInfoExpiry');
        return { city: 'Unknown', country: 'Global' };
      }
    }
  }

  return { city: 'Unknown', country: 'Global' };
};
