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
                    // Check if it's a valid comparison array
                    const isValid = imported.every(item => 
                        item && 
                        typeof item === 'object' && 
                        item.hasOwnProperty('id') && 
                        item.hasOwnProperty('config')
                    );
                    
                    if (isValid) {
                        this.comparisons = imported;
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
