// services/configuration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { Configuration, ApiResponse } from '../models/pricings-elements';
import { environment } from 'src/environments/environment';
import { AdminService } from './admin.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private urlAdmin = environment.backend_api_url + environment.admin_url;
    private configurationSubject = new BehaviorSubject<Configuration[]>([]);
    public configuration$ = this.configurationSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private errorSubject = new BehaviorSubject<string | null>(null);
    public error$ = this.errorSubject.asObservable();

    constructor(private http: HttpClient, private adminService: AdminService) { }

    /**
     * Récupère les configurations depuis l'API
     */
    getConfigurations(): Observable<Configuration[]> {
        return this.adminService.getConfigs().pipe(
            map(response => {
                this.validateApiResponse(response);
                return response.data;
            }),
            retry(2), // Retry automatique en cas d'échec
            catchError(error => {
                console.error('Erreur lors de la récupération des configurations:', error);
                throw error;
            })
        );
    }

    /**
     * Met à jour les configurations et les stocke dans le BehaviorSubject
     */
    updateConfigurations(): Promise<Configuration[]> {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);

        return new Promise((resolve, reject) => {
            this.getConfigurations().subscribe({
                next: (configs) => {
                    this.configurationSubject.next(configs);
                    this.loadingSubject.next(false);
                    this.errorSubject.next(null);
                    console.log('Configurations mises à jour:', configs.length, 'éléments');
                    resolve(configs);
                },
                error: (error) => {
                    this.loadingSubject.next(false);
                    const errorMessage = this.extractErrorMessage(error);
                    this.errorSubject.next(errorMessage);
                    console.error('Erreur lors de la mise à jour des configurations:', error);
                    reject(error);
                }
            });
        });
    }

    /**
     * Récupère une configuration par sa clé et retourne sa valeur numérique
     */
    getConfigByKey(key: string): number {
        const config = this.configurationSubject.value.find(c => c.key === key);
        if (!config) {
            console.warn(`Configuration non trouvée pour la clé: ${key}`);
            return 0;
        }

        const numericValue = Number(config.value);
        if (isNaN(numericValue)) {
            console.warn(`Valeur non numérique pour la configuration ${key}: ${config.value}`);
            return 0;
        }

        return numericValue;
    }

    /**
     * Récupère une configuration par sa clé et retourne sa valeur sous forme de string
     */
    getConfigStringByKey(key: string): string {
        const config = this.configurationSubject.value.find(c => c.key === key);
        if (!config) {
            console.warn(`Configuration non trouvée pour la clé: ${key}`);
            return '';
        }
        return String(config.value);
    }

    /**
     * Récupère une configuration par sa clé et retourne sa valeur sous forme de boolean
     */
    getConfigBooleanByKey(key: string): boolean {
        const config = this.configurationSubject.value.find(c => c.key === key);
        if (!config) {
            console.warn(`Configuration non trouvée pour la clé: ${key}`);
            return false;
        }

        const value = String(config.value).toLowerCase();
        return value === 'true' || value === '1' || value === 'yes';
    }

    /**
     * Récupère une configuration complète par sa clé
     */
    getFullConfigByKey(key: string): Configuration | null {
        const config = this.configurationSubject.value.find(c => c.key === key);
        return config || null;
    }

    /**
     * Vérifie si une configuration existe
     */
    hasConfig(key: string): boolean {
        return this.configurationSubject.value.some(c => c.key === key);
    }

    /**
     * Récupère toutes les configurations actuellement en mémoire
     */
    getAllConfigurations(): Configuration[] {
        return [...this.configurationSubject.value];
    }

    /**
     * Recherche des configurations par pattern de clé
     */
    getConfigsByKeyPattern(pattern: string): Configuration[] {
        const regex = new RegExp(pattern, 'i');
        return this.configurationSubject.value.filter(c => regex.test(c.key));
    }

    /**
     * Force le rafraîchissement des configurations
     */
    refreshConfigurations(): Promise<Configuration[]> {
        console.log('Rafraîchissement forcé des configurations...');
        return this.updateConfigurations();
    }

    /**
     * Réinitialise les erreurs
     */
    clearErrors(): void {
        this.errorSubject.next(null);
    }

    /**
     * Valide la structure de la réponse API
     */
    private validateApiResponse(response: ApiResponse<Configuration[]>): void {
        if (!response) {
            throw new Error('Réponse API vide');
        }

        if (response.statusCode !== 1000) {
            throw new Error(`Erreur API: ${response.message || 'Erreur inconnue'} (Code: ${response.statusCode})`);
        }

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Format de données invalide dans la réponse API');
        }

        // Validation de la structure des configurations
        for (const config of response.data) {
            if (!config._id || !config.key || config.value === undefined) {
                console.warn('Configuration avec structure invalide détectée:', config);
            }
        }
    }

    /**
     * Extrait un message d'erreur lisible
     */
    private extractErrorMessage(error: any): string {
        if (error.error?.message) {
            return `${error.error.message} erreur1`;
        }

        if (error.message) {
            return `${error.message} erreur2`;
        }

        if (error.status === 0) {
            return 'Erreur de connexion au serveur';
        }

        if (error.status === 401) {
            return 'Non autorisé - Veuillez vous reconnecter';
        }

        if (error.status === 403) {
            return 'Accès refusé';
        }

        if (error.status === 404) {
            return 'Endpoint non trouvé';
        }

        if (error.status >= 500) {
            return 'Erreur serveur - Veuillez réessayer plus tard';
        }

        return 'Une erreur inconnue est survenue';
    }
}
