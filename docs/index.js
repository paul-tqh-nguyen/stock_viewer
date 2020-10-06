{
    /***************/
    /* Misc. Utils */
    /***************/

    const isUndefined = value => value === void(0);
    const roundDecimals = (float, numberOfDecimalPlaces) => Math.round(float * 10**numberOfDecimalPlaces) / 10**numberOfDecimalPlaces;
    const numberToMoneyString = number => (Math.sign(number) === -1 ? '-' : '') + '$' + Math.abs(roundDecimals(number, 2)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const floatToPercentString = number => (number*100).toFixed(2) + '%';
    const dateFromString = string => new Date(Date.parse(string));
    const unzip = (tuples) => {
        const unzipped = [];
        for(let i=0; i<tuples[0].length; i++) {
            unzipped.push(tuples.map(tuple => tuple[i]));
        }
        return unzipped;
    };
    const removeAllChildNodes = (parent) => {
	while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
	}
    };
    Array.prototype.mean = function() {
	return this.reduce((a, b) => a + b, 0) / this.length;
    };
    
    /**********************/
    /* HTML Element Utils */
    /**********************/
    
    const createNewElement = (childTag, {classes, attributes, innerHTML}={}) => {
        const newElement = document.createElement(childTag);
        if (!isUndefined(classes)) {
            classes.forEach(childClass => newElement.classList.add(childClass));
        }
        if (!isUndefined(attributes)) {
            Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
                newElement.setAttribute(attributeName, attributeValue);
            });
        }
        if (!isUndefined(innerHTML)) {
            newElement.innerHTML = innerHTML;
        }
        return newElement;
    };

    const createTableWithElements = (rows, {classes, attributes}={}) => {
        const table = createNewElement('table', {classes, attributes});
        rows.forEach(elements => {
            const tr = document.createElement('tr');
            table.append(tr);
            elements.forEach(element => {
                const td = document.createElement('td');
                tr.append(td);
                td.append(element);
            });
        });
        return table;
    };

    const createContainer = (elements, {classes, attributes}={}) => {
        const container = createNewElement('div', {classes, attributes});
        elements.forEach(element => {
            container.append(element);
        });
        return container;
    };
    
    const createExpandable = (buttonElement, contentElement, {classes, attributes, onclick}={}) => {
        /* onclick (if given) is a unary function taking a bool denoting whether or not the expandable is expanded. */
        const container = createNewElement('div', {classes, attributes});
        container.append(buttonElement);
        buttonElement.classList.add('expandable-button');
        container.append(contentElement);
        contentElement.classList.add('expandable-content');
        buttonElement.onclick = (event) => {
            buttonElement.classList.toggle('active');
            contentElement.classList.toggle('active');
            if (contentElement.classList.contains('active')) {
                if (onclick) {
                    onclick(true);
                }
                contentElement.style.maxHeight = contentElement.scrollHeight * 1.25 + 'px'; // @todo mulltiplication is a work around
            } else {
                if (onclick) {
                    onclick(true);
                }
                contentElement.style.maxHeight = null;
            }
        };
        return container;
    };

    /******************/
    /* Loading Screen */
    /******************/

    const animationDuration = 1;
    const approximateBlockSize = 60;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const horizontalBlockCount = Math.floor(width/approximateBlockSize);
    const verticalBlockCount = Math.floor(height/approximateBlockSize);
    const blockWidth = width/horizontalBlockCount;
    const blockHeight = height/verticalBlockCount;
    
    const loadingScreenDiv = createNewElement('div', {classes: [], attributes: {id: 'loading-screen'}});
    document.querySelector('body').append(loadingScreenDiv);
    for(let i=0; i < horizontalBlockCount; i++) {
        for(let j=0; j < verticalBlockCount; j++) {
            const loadingBlock = createNewElement('div', {classes: ['loading-block']});
            loadingBlock.style.width = `${blockWidth}px`;
            loadingBlock.style.height = `${blockHeight}px`;
            loadingBlock.style.left = `${i*blockWidth}px`;
            loadingBlock.style.top = `${j*blockHeight}px`;
            loadingBlock.style.animationDelay = `${Math.random()*10*animationDuration}s`;
            loadingScreenDiv.append(loadingBlock);
        }
    }
    const loadingScreenTextElement = createNewElement('h1', {attributes: {id: 'loading-screen-text'}, innerHTML: 'Loading...'});
    loadingScreenDiv.append(loadingScreenTextElement);

    /****************/
    /* Display Data */
    /****************/

    const generateDateContainer = (dateData) => {
        const dateContainer = createNewElement('div', {classes: ['stats-and-chart-container']});
        const iframeContainer = createNewElement('div', {classes: ['iframe-container']});
        const onclick = (isActive) => {
            removeAllChildNodes(iframeContainer);
            if (isActive) {
                const iframe = createNewElement('iframe', {
                    classes: ['chart-iframe'],
                    attributes: {
                        src: dateData.html_file,
                        sandbox: 'allow-same-origin allow-scripts',
                        scrolling: 'no',
      	                seamless: 'seamless',
      	                frameborder: '0'
                    }
                });
                iframeContainer.append(iframe);
            }
        };
        const openingPriceLabel = createNewElement('p', {innerHTML: 'Opening Price: '});
        const openingPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.opening_price)});
        const closingPriceLabel = createNewElement('p', {innerHTML: 'Closing Price: '});
        const closingPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.closing_price)});
        const minPriceLabel = createNewElement('p', {innerHTML: 'Min Price: '});
        const minPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.min_price)});
        const maxPriceLabel = createNewElement('p', {innerHTML: 'Max Price: '});
        const maxPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.max_price)});
        const maxIncreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Biggest Jump'});
        const maxIncreaseFromOpeningPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.max_price-dateData.opening_price)});
        const maxDecreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Biggest Dip'});
        const maxDecreaseFromOpeningPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.min_price-dateData.opening_price)});
        const maxIncreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Biggest Jump %'});
        const maxIncreaseFromOpeningPricePercentValueElement = createNewElement('p', {innerHTML: floatToPercentString((dateData.max_price-dateData.opening_price)/dateData.opening_price)});
        const maxDecreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Biggest Dip %'});
        const maxDecreaseFromOpeningPricePercentValueElement = createNewElement('p', {innerHTML: floatToPercentString((dateData.min_price-dateData.opening_price)/dateData.opening_price)});
        const statsTable = createTableWithElements([
            [openingPriceLabel, openingPriceValueElement],
            [closingPriceLabel, closingPriceValueElement],
            [minPriceLabel, minPriceValueElement],
            [maxPriceLabel, maxPriceValueElement],
            [maxIncreaseFromOpeningPriceLabel, maxIncreaseFromOpeningPriceValueElement],
            [maxDecreaseFromOpeningPriceLabel, maxDecreaseFromOpeningPriceValueElement],
            [maxIncreaseFromOpeningPricePercentLabel, maxIncreaseFromOpeningPricePercentValueElement],
            [maxDecreaseFromOpeningPricePercentLabel, maxDecreaseFromOpeningPricePercentValueElement],
        ], {classes: ['stats-table']});
        const statsAndChartTable = createTableWithElements([[statsTable, iframeContainer]], {classes: ['stats-and-chart-table']});
        dateContainer.append(statsAndChartTable);
        return [dateContainer, onclick];
    };

    const generateCombinedDatesContainer = (tickerSymbolData) => {
        const container = createNewElement('div', {classes: ['stats-and-chart-container']});
        const iframeContainer = createNewElement('div', {classes: ['iframe-container']});
        const onclick = (isActive) => {
            removeAllChildNodes(iframeContainer);
            if (isActive) {
                const iframe = createNewElement('iframe', {
                    classes: ['chart-iframe'],
                    attributes: {
                        src: tickerSymbolData.combined_date_html_file,
                        sandbox: 'allow-same-origin allow-scripts',
                        scrolling: 'no',
      	                seamless: 'seamless',
      	                frameborder: '0'
                    }
                });
                iframeContainer.append(iframe);
            }
        };
        const meanOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Opening Price: '});
        const meanOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.opening_price).mean())});
        const meanClosingPriceLabel = createNewElement('p', {innerHTML: 'Mean Closing Price: '});
        const meanClosingPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.closing_price).mean())});
        const meanMinPriceLabel = createNewElement('p', {innerHTML: 'Mean Min Price: '});
        const meanMinPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.min_price).mean())});
        const meanMaxPriceLabel = createNewElement('p', {innerHTML: 'Mean Max Price: '});
        const meanMaxPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.max_price).mean())});
        const meanMaxIncreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Biggest Jump'});
        const meanMaxIncreaseFromOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.max_price-data_for_date.opening_price).mean()
        )});
        const meanMaxDecreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Biggest Dip'});
        const meanMaxDecreaseFromOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.min_price-data_for_date.opening_price).mean()
        )});
        const meanMaxIncreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Mean Biggest Jump %'});
        const meanMaxIncreaseFromOpeningPricePercentValue = createNewElement('p', {innerHTML: floatToPercentString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => (data_for_date.max_price-data_for_date.opening_price)/data_for_date.opening_price).mean()
        )});
        const meanMaxDecreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Mean Biggest Dip %'});
        const meanMaxDecreaseFromOpeningPricePercentValue = createNewElement('p', {innerHTML: floatToPercentString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => (data_for_date.min_price-data_for_date.opening_price)/data_for_date.opening_price).mean()
        )});
        const statsTable = createTableWithElements([
            [meanOpeningPriceLabel, meanOpeningPriceValue],
            [meanClosingPriceLabel, meanClosingPriceValue],
            [meanMinPriceLabel, meanMinPriceValue],
            [meanMaxPriceLabel, meanMaxPriceValue],
            [meanMaxIncreaseFromOpeningPriceLabel, meanMaxIncreaseFromOpeningPriceValue],
            [meanMaxDecreaseFromOpeningPriceLabel, meanMaxDecreaseFromOpeningPriceValue],
            [meanMaxIncreaseFromOpeningPricePercentLabel, meanMaxIncreaseFromOpeningPricePercentValue],
            [meanMaxDecreaseFromOpeningPricePercentLabel, meanMaxDecreaseFromOpeningPricePercentValue],
        ], {classes: ['stats-table']});
        const statsAndChartTable = createTableWithElements([[statsTable, iframeContainer]], {classes: ['stats-and-chart-table']});
        container.append(statsAndChartTable);
        return [container, onclick];
    };

    const generateTickerSymbolExpandable = ([tickerSymbol, tickerSymbolData]) => {
        const tickerSymbolLabel = createNewElement('p', {classes: ['ticker-symbol-label'], innerHTML: tickerSymbol});

        const [dateContainers, dateContainersOnClicks] = unzip(
            Object.entries(tickerSymbolData.date_data)
                .sort(([dateStringA, dateDataA],[dateStringB, dateDataB]) => dateFromString(dateStringB) - dateFromString(dateStringA))
                .map(item => item[1])
                .map(generateDateContainer)
        );
        const allDatesContainer = createContainer(dateContainers, {classes: ['all-dates-container']});
        const [combinedDatesContainer, combinedDatesContainerOnClick] = generateCombinedDatesContainer(tickerSymbolData);
        
        const tickerSymbolContent = createTableWithElements([[combinedDatesContainer, allDatesContainer]], {classes: ['ticker-symbol-content']});

        const expandableOnClick = (isActive) => {
            combinedDatesContainerOnClick(isActive);
            dateContainersOnClicks.forEach(dateContainersOnClick => dateContainersOnClick(isActive));
        };
        const tickerSymbolExpandable = createExpandable(tickerSymbolLabel, tickerSymbolContent, {classes: ['ticker-symbol-expandable'], onclick: expandableOnClick});
        return tickerSymbolExpandable;
    };
    
    fetch('./output/output_summary.json')
        .then(response => response.json())
        .then(outputSummary => {
            const tickerSymbolExpandables = Object.entries(outputSummary).map(generateTickerSymbolExpandable);
            const allTickerSymbolDataContainer = createContainer(tickerSymbolExpandables, {attributes: {id: 'all-ticker-symbol-data-container'}});
            document.querySelector('body').append(allTickerSymbolDataContainer);
            setTimeout(() => { // loading screen isn't strictly necessary, but I like the animation 
                document.querySelectorAll('*').forEach(loadingBlock => {
                    loadingBlock.style.top = '-100vh';
                });
            }, 2000);
        });
}
