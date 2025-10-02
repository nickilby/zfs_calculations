# ZFS Storage Calculator

A comprehensive web-based calculator for planning ZFS storage configurations with cost analysis and comparison features.

## Features

### 🧮 **Storage Calculations**
- **Multiple RAID Types**: Mirror, RAIDZ, RAIDZ2, RAIDZ3, DRAID1, DRAID2, DRAID3
- **VDEV Configuration**: Support for multiple VDEVs with automatic drive distribution
- **ZFS Overhead**: Accounts for 80% usable storage after ZFS overhead
- **Real-time Calculations**: Instant updates as you modify parameters

### 💰 **Cost Analysis**
- **Per-GB Cost Calculation**: Automatic cost per usable GB calculation
- **Drive Cost Tracking**: Individual drive pricing and total drive costs
- **Chassis Cost Integration**: Include server/chassis costs in total calculations
- **Currency Support**: British Pound (£) formatting

### 📊 **Comparison Tools**
- **Save Configurations**: Save multiple storage configurations for comparison
- **Load & Edit**: Load saved configurations back into the form for modifications
- **Export/Import**: Save comparisons to JSON files for backup and sharing
- **Persistent Storage**: Uses localStorage to maintain comparisons between sessions

### 🎯 **User Experience**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern design with clear visual feedback
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter`: Add current configuration to comparison
  - `Ctrl+Delete`: Clear all comparisons
- **Smooth Animations**: Smooth scrolling and transitions

## Usage

### Basic Calculation
1. **Enter Drive Details**: Drive size (TB), cost per drive, and model
2. **Select Drive Type**: SATA, NVME U.2, NVME U.3, or NVME M.2
3. **Configure Storage**: Number of drives, VDEVs, and RAID type
4. **Add Chassis Cost**: Optional server/chassis cost
5. **View Results**: See raw storage, usable storage, and cost per GB

### Comparison Features
1. **Add to Comparison**: Click "Add to Comparison" to save current configuration
2. **Load Configuration**: Click "Load" on any saved configuration to edit it
3. **Export Data**: Click "Export" to download comparisons as JSON
4. **Import Data**: Click "Import" to load previously exported comparisons

### Supported RAID Types

| Type | Description | Usable Storage |
|------|-------------|----------------|
| **Mirror** | 2+ drives per VDEV, 1 drive usable | 1 drive per VDEV |
| **RAIDZ** | 3+ drives per VDEV, 1 parity | (drives-1) per VDEV |
| **RAIDZ2** | 4+ drives per VDEV, 2 parity | (drives-2) per VDEV |
| **RAIDZ3** | 5+ drives per VDEV, 3 parity | (drives-3) per VDEV |
| **DRAID1** | Distributed RAID with 1 parity | (drives-1) per VDEV |
| **DRAID2** | Distributed RAID with 2 parity | (drives-2) per VDEV |
| **DRAID3** | Distributed RAID with 3 parity | (drives-3) per VDEV |

## Technical Details

### Storage Calculation Formula
```
Raw Storage = Drive Size × Number of Drives
Usable per VDEV = (Drives per VDEV - Parity) × Drive Size
Total Usable = Usable per VDEV × Number of VDEVs
ZFS Usable = Total Usable × 0.8 (20% ZFS overhead)
```

### Cost Calculation
```
Total Drive Cost = Number of Drives × Cost per Drive
Total Cost = Total Drive Cost + Chassis Cost
Cost per GB = Total Cost ÷ (ZFS Usable Storage × 1024)
```

## File Structure

```
zfs_calculations/
├── index.html          # Main HTML structure
├── script.js           # JavaScript application logic
├── styles.css          # CSS styling and responsive design
└── README.md           # This documentation
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zfs_calculations.git
   cd zfs_calculations
   ```

2. **Open in browser**:
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Or simply open index.html in your browser
   open index.html
   ```

3. **Access the application**:
   - Local: `http://localhost:8000`
   - Or open `index.html` directly in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/zfs_calculations/issues) page
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

## Changelog

### v1.2.0 - Load Configuration Feature
- ✅ Added Load button to comparison table
- ✅ Implemented configuration loading into form
- ✅ Added smart parsing of saved configurations
- ✅ Enhanced UX with smooth scrolling and feedback

### v1.1.0 - Import/Export Enhancement
- ✅ Improved import validation with data sanitization
- ✅ Added defensive programming for missing fields
- ✅ Enhanced error handling and user feedback
- ✅ Fixed "Cannot read properties of undefined" errors

### v1.0.0 - Initial Release
- ✅ Basic ZFS storage calculations
- ✅ Multiple RAID type support
- ✅ Cost analysis and comparison features
- ✅ Export/import functionality
- ✅ Responsive design

---

**Made with ❤️ for the ZFS community**
