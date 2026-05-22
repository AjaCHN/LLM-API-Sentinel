// app/hooks/useGeoLocation.ts v2.5.1
import { useEffect } from 'react';
import { GEO_INFO_EXPIRY } from '../constants';
import { logError } from '../lib/error';
import { useGeoStore, GeoLocation } from '../store';

export function useGeoLocation() {
  const { geo, isLoading, setGeo, setIsLoading } = useGeoStore();

  useEffect(() => {
    const fetchGeoLocation = async () => {
      try {
        // 检查本地存储是否有缓存的地理位置信息
        const cachedGeo = localStorage.getItem('geoInfo');
        if (cachedGeo) {
          try {
            const parsedGeo = JSON.parse(cachedGeo);
            setGeo(parsedGeo);
            setIsLoading(false);
          } catch (error) {
            logError(error, 'Failed to parse cached geo info');
          }
        }

        // 检查缓存是否过期
        const expiry = localStorage.getItem('geoInfoExpiry');
        const isExpired = !expiry || Date.now() > parseInt(expiry);

        // 只有当没有缓存或缓存过期时才请求
        if (!cachedGeo || isExpired) {
          setIsLoading(true);
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          const geoData: GeoLocation = {
            city: data.city || 'Unknown',
            country: data.country_name || 'Global',
            ip: data.ip
          };
          
          setGeo(geoData);
          
          // 缓存地理位置信息，有效期24小时
          localStorage.setItem('geoInfo', JSON.stringify(geoData));
          localStorage.setItem('geoInfoExpiry', String(Date.now() + GEO_INFO_EXPIRY));
        }
      } catch (error) {
        logError(error, 'Failed to fetch geo info');
        setGeo({ city: 'Unknown', country: 'Global' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoLocation();
  }, [setGeo, setIsLoading]);

  return { geo, isLoading };
}
