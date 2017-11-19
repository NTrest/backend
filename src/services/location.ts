export class LocationService {

    private static instance: LocationService;
    public static get Instance() {
        if (!this.instance) {
            this.instance = new LocationService();
        }

        return this.instance;
    }

    private constructor() {}


    

}