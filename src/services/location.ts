import * as config from '../config';

import * as geocoder from 'node-geocoder';


const options: geocoder.Options = {
    provider: 'google',
   
    // Optional depending on the providers
    httpAdapter: 'http', // Default
    apiKey: config.mapsapikey, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

const geo = geocoder(options);

export class LocationService {

    private static instance: LocationService;
    public static Instance() {
        if (!this.instance) {
            this.instance = new LocationService();
        }

        return this.instance;
    }

    private constructor() {}

    getDistanceSq(c1: any, c2: any) {
        const deglen = 12155.0625; // 110.25 squarerooted
        const x = c1.lat - c2.lat
        const y = (c1.lon - c2.lon)*c2.latcos;
        return deglen*(x*x + y*y);
    }

    getLocation(coords: any): Promise<geocoder.Entry> {
        return geo.reverse({lat: coords.lat, lon: coords.lon}).then((res) => {
            if (res.length <= 0) {
                return Promise.reject("No entries found");
            }

            return Promise.resolve(res[0]);
        });
    }

    getCityComparable(entry: geocoder.Entry): string {
        return `${entry.city}#${entry.administrativeLevels.level1short}#${entry.administrativeLevels.level2short}`;
    }
    

}