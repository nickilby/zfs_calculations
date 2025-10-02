// ZFS Storage Calculator JavaScript

class ZFSCalculator {
    constructor() {
        this.comparisons = [];
        this.loadComparisons();
        this.initializeEventListeners();
        this.calculate();
    }

    initializeEventListeners() {
        // Get all input elements
        const inputs = [
            'driveSize', 'driveCost', 'driveModel', 'driveType', 'totalDrives', 'numVdevs', 
            'poolType', 'chassisCost'
        ];

        // Add event listeners to all inputs
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.calculate());
                element.addEventListener('change', () => this.calculate());
            }
        });

        // Slider value display and calculation
        const slider = document.getElementById('numVdevs');
        const sliderValue = document.getElementById('numVdevsValue');
        if (slider && sliderValue) {
            // Set initial value
            sliderValue.textContent = slider.value;
            
            slider.addEventListener('input', () => {
                sliderValue.textContent = slider.value;
                this.calculate();
            });
        }

        // Comparison buttons
        const addBtn = document.getElementById('addComparison');
        const clearBtn = document.getElementById('clearComparison');
        const exportBtn = document.getElementById('exportComparisons');
        const importBtn = document.getElementById('importComparisons');
        const importFile = document.getElementById('importFile');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addToComparison());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearComparisons());
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportComparisons());
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importComparisons(e.target.files[0]);
                }
            });
        }
    }

    getInputValues() {
        return {
            driveSize: parseFloat(document.getElementById('driveSize')?.value || 0),
            driveCost: parseFloat(document.getElementById('driveCost')?.value || 0),
            driveModel: document.getElementById('driveModel')?.value || '',
            driveType: document.getElementById('driveType')?.value || 'sata',
            totalDrives: parseInt(document.getElementById('totalDrives')?.value || 0),
            numVdevs: parseInt(document.getElementById('numVdevs')?.value || 1),
            poolType: document.getElementById('poolType')?.value || 'mirror',
            chassisCost: parseFloat(document.getElementById('chassisCost')?.value || 0)
        };
    }

    calculateZFSStorage(driveSize, totalDrives, numVdevs, poolType) {
        const drivesPerVdev = Math.floor(totalDrives / numVdevs);
        const rawStorage = totalDrives * driveSize;
        
        let usableStoragePerVdev;
        let redundancyInfo;

        switch (poolType) {
            case 'mirror':
                usableStoragePerVdev = driveSize; // Only one drive per mirror
                redundancyInfo = `Mirror: 1 drive per VDEV (${drivesPerVdev} drives per VDEV for redundancy)`;
                break;
            case 'raidz1':
                usableStoragePerVdev = (drivesPerVdev - 1) * driveSize;
                redundancyInfo = `RAIDZ1: ${drivesPerVdev - 1} drives usable per VDEV (1 parity)`;
                break;
            case 'raidz2':
                usableStoragePerVdev = (drivesPerVdev - 2) * driveSize;
                redundancyInfo = `RAIDZ2: ${drivesPerVdev - 2} drives usable per VDEV (2 parity)`;
                break;
            case 'raidz3':
                usableStoragePerVdev = (drivesPerVdev - 3) * driveSize;
                redundancyInfo = `RAIDZ3: ${drivesPerVdev - 3} drives usable per VDEV (3 parity)`;
                break;
            case 'draid1':
                // DRAID1 with distributed spare
                usableStoragePerVdev = (drivesPerVdev - 1) * driveSize;
                redundancyInfo = `DRAID1: ${drivesPerVdev - 1} drives usable per VDEV (1 distributed parity)`;
                break;
            case 'draid2':
                usableStoragePerVdev = (drivesPerVdev - 2) * driveSize;
                redundancyInfo = `DRAID2: ${drivesPerVdev - 2} drives usable per VDEV (2 distributed parity)`;
                break;
            case 'draid3':
                usableStoragePerVdev = (drivesPerVdev - 3) * driveSize;
                redundancyInfo = `DRAID3: ${drivesPerVdev - 3} drives usable per VDEV (3 distributed parity)`;
                break;
            default:
                usableStoragePerVdev = driveSize;
                redundancyInfo = 'Unknown pool type';
        }

        const totalUsableStorage = usableStoragePerVdev * numVdevs;
        const zfsUsableStorage = totalUsableStorage * 0.8; // 80% for ZFS overhead

        return {
            rawStorage,
            totalUsableStorage,
            zfsUsableStorage,
            drivesPerVdev,
            redundancyInfo
        };
    }

    calculate() {
        const values = this.getInputValues();
        
        if (values.driveSize <= 0 || values.totalDrives <= 0) {
            this.updateResults({
                costPerGB: 0,
                rawStorage: 0,
                usableStorage: 0,
                driveCostTotal: 0,
                chassisCost: values.chassisCost,
                totalCost: values.chassisCost,
                vdevInfo: 'Please enter valid drive size and number of drives'
            });
            return;
        }

        // Calculate storage
        const storage = this.calculateZFSStorage(
            values.driveSize, 
            values.totalDrives, 
            values.numVdevs, 
            values.poolType
        );

        // Calculate costs
        const driveCostTotal = values.totalDrives * values.driveCost;
        const totalCost = driveCostTotal + values.chassisCost;
        const costPerGB = storage.zfsUsableStorage > 0 ? 
            totalCost / (storage.zfsUsableStorage * 1024) : 0;

        // Update results
        this.updateResults({
            costPerGB,
            rawStorage: storage.rawStorage,
            usableStorage: storage.zfsUsableStorage,
            driveCostTotal,
            chassisCost: values.chassisCost,
            totalCost,
            vdevInfo: `${values.numVdevs} VDEVs, ${storage.drivesPerVdev} drives each. ${storage.redundancyInfo}`
        });
    }

    updateResults(results) {
        // Update all result displays
        const costPerGBEl = document.getElementById('costPerGB');
        const rawStorageEl = document.getElementById('rawStorage');
        const usableStorageEl = document.getElementById('usableStorage');
        const driveCostTotalEl = document.getElementById('driveCostTotal');
        const chassisCostDisplayEl = document.getElementById('chassisCostDisplay');
        const totalCostEl = document.getElementById('totalCost');
        const vdevDetailsEl = document.getElementById('vdevDetails');

        if (costPerGBEl) costPerGBEl.textContent = `£${results.costPerGB.toFixed(4)}`;
        if (rawStorageEl) rawStorageEl.textContent = `${results.rawStorage.toFixed(2)} TB`;
        if (usableStorageEl) usableStorageEl.textContent = `${results.usableStorage.toFixed(2)} TB`;
        if (driveCostTotalEl) driveCostTotalEl.textContent = `£${results.driveCostTotal.toFixed(2)}`;
        if (chassisCostDisplayEl) chassisCostDisplayEl.textContent = `£${results.chassisCost.toFixed(2)}`;
        if (totalCostEl) totalCostEl.textContent = `£${results.totalCost.toFixed(2)}`;
        if (vdevDetailsEl) vdevDetailsEl.textContent = results.vdevInfo;
    }

    addToComparison() {
        const values = this.getInputValues();
        const storage = this.calculateZFSStorage(
            values.driveSize, 
            values.totalDrives, 
            values.numVdevs, 
            values.poolType
        );

        const driveCostTotal = values.totalDrives * values.driveCost;
        const totalCost = driveCostTotal + values.chassisCost;
        const costPerGB = storage.zfsUsableStorage > 0 ? 
            totalCost / (storage.zfsUsableStorage * 1024) : 0;

        const comparison = {
            id: Date.now(),
            config: `${values.driveSize}TB × ${values.totalDrives} drives`,
            driveModel: values.driveModel || 'Not specified',
            driveType: this.getDriveTypeName(values.driveType),
            unitPrice: values.driveCost,
            poolType: this.getPoolTypeName(values.poolType),
            vdevs: values.numVdevs,
            rawStorage: storage.rawStorage,
            usableStorage: storage.zfsUsableStorage,
            totalCost: totalCost,
            costPerGB: costPerGB
        };

        this.comparisons.push(comparison);
        this.saveComparisons();
        this.updateComparisonTable();
    }

    getPoolTypeName(poolType) {
        const names = {
            'mirror': 'Mirrored',
            'raidz1': 'RAIDZ',
            'raidz2': 'RAIDZ2',
            'raidz3': 'RAIDZ3',
            'draid1': 'DRAID1',
            'draid2': 'DRAID2',
            'draid3': 'DRAID3'
        };
        return names[poolType] || poolType;
    }

    getDriveTypeName(driveType) {
        const names = {
            'sata': 'SATA',
            'nvme-u2': 'NVME U.2',
            'nvme-u3': 'NVME U.3',
            'nvme-m2': 'NVME M.2'
        };
        return names[driveType] || driveType;
    }

    updateComparisonTable() {
        const container = document.getElementById('comparisonRows');
        if (!container) return;

        container.innerHTML = '';

        this.comparisons.forEach(comparison => {
            const row = document.createElement('div');
            row.className = 'comparison-row';
            row.innerHTML = 
                `<div class="col">${comparison.config}</div>
                <div class="col">${comparison.driveModel}</div>
                <div class="col">${comparison.driveType}</div>
                <div class="col">£${(comparison.unitPrice || 0).toFixed(2)}</div>
                <div class="col">${comparison.poolType}</div>
                <div class="col">${comparison.vdevs || 1}</div>
                <div class="col">${(comparison.rawStorage || 0).toFixed(2)} TB</div>
                <div class="col">${(comparison.usableStorage || 0).toFixed(2)} TB</div>
                <div class="col">£${(comparison.totalCost || 0).toFixed(2)}</div>
                <div class="col">£${(comparison.costPerGB || 0).toFixed(4)}</div>
                <div class="col">
                    <button class="remove-btn" onclick="calculator.removeComparison(${comparison.id})">
                        Remove
                    </button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    removeComparison(id) {
        this.comparisons = this.comparisons.filter(comp => comp.id !== id);
        this.saveComparisons();
        this.updateComparisonTable();
    }

    clearComparisons() {
        this.comparisons = [];
        this.saveComparisons();
        this.updateComparisonTable();
    }

    // LocalStorage methods for persistence
    saveComparisons() {
        try {
            localStorage.setItem('zfsComparisons', JSON.stringify(this.comparisons));
        } catch (error) {
            console.warn('Could not save comparisons to localStorage:', error);
        }
    }

    loadComparisons() {
        try {
            const saved = localStorage.getItem('zfsComparisons');
            if (saved) {
                this.comparisons = JSON.parse(saved);
                this.updateComparisonTable();
            }
        } catch (error) {
            console.warn('Could not load comparisons from localStorage:', error);
            this.comparisons = [];
        }
    }

    // Export/Import functionality
    exportComparisons() {
        const dataStr = JSON.stringify(this.comparisons, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zfs-comparisons-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    importComparisons(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let fileContent = e.target.result;
                
                // Clean up the content - remove any BOM or extra whitespace
                fileContent = fileContent.trim();
                
                // Try to parse the JSON
                const imported = JSON.parse(fileContent);
                
                // Validate the imported data
                if (Array.isArray(imported)) {
                    // Check if it's a valid comparison array and sanitize data
                    const isValid = imported.every(item => 
                        item && 
                        typeof item === 'object' && 
                        item.hasOwnProperty('id') && 
                        item.hasOwnProperty('config')
                    );
                    
                    if (isValid) {
                        // Sanitize and validate numeric fields to prevent toFixed errors
                        const sanitizedComparisons = imported.map(item => ({
                            ...item,
                            unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
                            rawStorage: typeof item.rawStorage === 'number' ? item.rawStorage : 0,
                            usableStorage: typeof item.usableStorage === 'number' ? item.usableStorage : 0,
                            totalCost: typeof item.totalCost === 'number' ? item.totalCost : 0,
                            costPerGB: typeof item.costPerGB === 'number' ? item.costPerGB : 0,
                            vdevs: typeof item.vdevs === 'number' ? item.vdevs : 1
                        }));
                        
                        this.comparisons = sanitizedComparisons;
                        this.saveComparisons();
                        this.updateComparisonTable();
                        alert(`Successfully imported ${imported.length} comparisons!`);
                    } else {
                        alert('Invalid file format. The file does not contain valid comparison data.');
                    }
                } else {
                    alert('Invalid file format. Please select a valid ZFS comparisons file.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert(`Error importing file: ${error.message}. Please check the file format and try again.`);
            }
        };
        
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };
        
        reader.readAsText(file, 'UTF-8');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new ZFSCalculator();
});

// Add some utility functions for better UX
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        calculator.addToComparison();
    }
    if (e.ctrlKey && e.key === 'Delete') {
        calculator.clearComparisons();
    }
});
