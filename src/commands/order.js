const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');
const stringSimilarity = require('string-similarity');
const axios = require('axios'); // Ensure axios is included

// Load customers, holidays, holiday names, and variants from JSON files
const customers = require('./customers.json', 'utf8');
const holidays = require('./holidays.json', 'utf8');
const holidayNames = require('./holidayNames.json', 'utf8');

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Starting number for holidays and month-to-order mappings
const holidayStartMap = {
    'cupcakeria': 12,
    'pastaria': 9,
    'donuteria': 5,
    'cheeseria': 9,
    'cupcakeria_togo': 12,
    'cupcakeria_hd': 12,
    'bakeria': 1,
    'tacomia_hd': 7,
    'sushiria': 10,
    'tacomia_togo': 7,
    'pancakeria_hd': 8,
    'pizzeria_hd': 3,
    'hotdoggeria_hd': 9,
    'hotdoggeria_togo': 9,
    'scooperia': 11,
    'scooperia_hd': 11,
    'scooperia_togo': 11,
    'pancakeria_togo': 8,
    'wingeria_togo': 9,
    'donuteria_togo': 5,
    'cheeseria_togo': 9,
    'bakeria_togo': 1,
    'sushiria_togo': 10,
    'pastaria_togo': 9,
    'mocharia': 4,
    'cluckeria': 7,
    'freezeria_deluxe': 7,
    'paleteria': 8
};
const monthOrderMap = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
};


// List of workers and closers for each game (as before)
const workers = {
    'mocharia': ['akari', 'allan'],
    'freezeria_deluxe': ['alberto', 'penny'],
    'scooperia': ['carloromano', 'koilee'],
    'scooperia_hd': ['carloromano', 'koilee'],
    'scooperia_togo': ['carloromano', 'koilee'],
    'bakeria': ['cecilia', 'timm'],
    'bakeria_togo': ['cecilia', 'timm'],
    'wingeria_hd': ['chuck', 'mandi'],
    'wingeria_togo': ['chuck', 'mandi'],
    'sushiria': ['clover', 'matt'],
    'sushiria_togo': ['clover', 'matt'],
    'pancakeria_hd': ['cooper', 'prudence'],
    'pancakeria_togo': ['cooper', 'prudence'],
    'pastaria': ['doan', 'utah'],
    'pastaria_togo': ['doan', 'utah'],
    'paleteria': ['hackyzak', 'liezel'],
    'cupcakeria_hd': ['james', 'willow'],
    'pizzeria_hd': ['joy', 'roy'],
    'burgeria': ['rita'],
    'cheeseria': ['rudy', 'scarlett'],
    'cheeseria_togo': ['rudy', 'scarlett'],
    'donuteria': ['scooter', 'tony'],
    'donuteria_togo': ['scooter', 'tony'],
    'hotdoggeria_hd': ['peggy', 'taylor'],
    'cluckeria': ['olivia', 'wylanb'],
    'tacomia_hd': ['maggie', 'mitch']
};

const closers = {
    'cupcakeria': ['trishna', 'radlynn', 'xolo', 'mayormallow', 'quinn', 'kenji'],
    'pastaria': ['deano', 'kahuna', 'quinn', 'crystal', 'radlynn', 'xolo'],
    'donuteria': ['rudy', 'hank', 'quinn', 'crystal', 'radlynn', 'xolo'],
    'cheeseria': ['rhonda', 'hank', 'radlynn', 'chester', 'quinn', 'xolo'],
    'cupcakeria_togo': ['radlynn', 'mayormallow', 'quinn', 'deano', 'crystal', 'xolo'],
    'cupcakeria_hd': ['radlynn', 'mayormallow', 'quinn', 'deano', 'rhonda', 'xolo'],
    'bakeria': ['whiff', 'radlynn', 'mayormallow', 'quinn', 'xolo', 'rhonda'],
    'tacomia_hd': ['robby', 'akari', 'allan', 'quinn', 'rico', 'xandra'],
    'sushiria': ['emmlette', 'whiff', 'akari', 'deano', 'quinn', 'xolo'],
    'tacomia_togo': ['robby', 'akari', 'allan', 'quinn', 'rico', 'xandra'],
    'pancakeria_hd': ['hank', 'emmlette', 'kahuna', 'quinn', 'johnny', 'xandra'],
    'pizzeria_hd': ['sargefan', 'whiff', 'radlynn', 'quinn', 'lepete', 'rhonda'],
    'hotdoggeria_hd': ['bertha', 'lepete', 'whiff', 'quinn', 'kenji', 'xandra'],
    'hotdoggeria_togo': ['bertha', 'lepete', 'whiff', 'quinn', 'kenji', 'xandra'],
    'scooperia': ['mousse', 'crystal', 'lepete', 'quinn', 'whippa', 'radlynn'],
    'scooperia_hd': ['mousse', 'crystal', 'lepete', 'quinn', 'whippa', 'radlynn'],
    'scooperia_togo': ['mousse', 'crystal', 'lepete', 'quinn', 'whippa', 'radlynn'],
    'pancakeria_togo': ['hank', 'emmlette', 'kahuna', 'quinn', 'johnny', 'xandra'],
    'wingeria_togo': ['mousse', 'rhonda', 'professorfitz', 'quinn', 'whippa', 'xandra'],
    'donuteria_togo': ['rudy', 'hank', 'quinn', 'crystal', 'radlynn', 'xolo'],
    'cheeseria_togo': ['rhonda', 'hank', 'radlynn', 'chester', 'quinn', 'xolo'],
    'bakeria_togo': ['whiff', 'radlynn', 'mayormallow', 'quinn', 'xolo', 'rhonda'],
    'sushiria_togo': ['emmlette', 'rollie', 'akari', 'deano', 'quinn', 'xolo'],
    'pastaria_togo': ['deano', 'kahuna', 'quinn', 'crystal', 'radlynn', 'xolo'],
    'mocharia': ['dukegotcha', 'whippa', 'petrona', 'quinn', 'bertha', 'mousse'],
    'cluckeria': ['dukegotcha', 'yuko', 'petrona', 'quinn', 'rico', 'mousse'],
    'freezeria_deluxe': ['kahuna', 'captaincori', 'gremmie', 'quinn', 'robby', 'xandra'],
    'paleteria': ['rollie', 'allykabam', 'rudy', 'quinn', 'allan', 'yuko']
};

// URL base for S3
const baseUrl = 'https://orders-flipbot.s3.us-east-2.amazonaws.com';

// Function to find the closest matching customer name using string similarity
const findClosestCustomer = (input) => {
    const lowerInput = input.toLowerCase();
    let closestMatch = null;
    let highestSimilarity = 0;

    customers.forEach(customer => {
        const similarity = stringSimilarity.compareTwoStrings(lowerInput, customer.name.toLowerCase());
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            closestMatch = customer.name;
        }
    });

    return highestSimilarity > 0.5 ? closestMatch : null;
};

// Function to construct file paths for orders
const getOrderPath = (gameVariantPath, customer, isHoliday) => {
    const baseUrl = 'https://orders-flipbot.s3.us-east-2.amazonaws.com';
    return isHoliday ?
        `${baseUrl}/${gameVariantPath}/Holiday/${customer}.png` :
        `${baseUrl}/${gameVariantPath}/${customer}.png`;
};

const getHolidayOrderNumber = (game, month, variant) => {
    // Combine the game and variant to form the correct key
    const gameKey = variant ? `${game}_${variant}` : game;
    const startNumber = holidayStartMap[gameKey]; // Get the correct starting number based on game+variant
    const monthIndex = monthOrderMap[month] - 1; // 0-based index for months
    return (startNumber + monthIndex - 1) % 12 + 1; // Wraps around if necessary
};

const getHolidayPath = (game, variant, customer, holidayNumber) => {
    const baseUrl = 'https://orders-flipbot.s3.us-east-2.amazonaws.com';
    const gameVariantPath = variant === 'togo' && ['mocharia', 'paleteria'].includes(game) ? game : `${game}_${variant}`;
    return `${baseUrl}/${gameVariantPath}/${customer}/${customer}${holidayNumber}.png`;
};

const isCloser = (gameVariantPath, customer) => {
    return closers[gameVariantPath]?.includes(customer);
};


// Function to check if the file exists on S3
const checkFileExists = async (url) => {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        console.error(`Error checking file existence at ${url}:`, error.message);
        return false;
    }
};


// Function to respond with the correct holiday order
const respondWithHolidayOrder = async (interaction, validCustomer, gameVariantPath, holidayNumber, month) => {
    // Use validCustomer.value to preserve casing for the customer folder
    const holidayPath = `${baseUrl}/${gameVariantPath}/Holiday/${encodeURIComponent(validCustomer.value)}.png`;

    console.log(`Looking for holiday order file at: ${holidayPath}`);

    const fileExists = await checkFileExists(holidayPath);

    if (fileExists) {
        const holidayAttachment = new AttachmentBuilder(holidayPath);
        await interaction.followUp({
            content: `**Holiday:** ${holidayNames[gameVariantPath][month]}`,
            files: [holidayAttachment],
            ephemeral: true
        });
    } else {
        await interaction.followUp({
            content: `Holiday order for **${capitalize(validCustomer.name)}** in **${month}** is not available.`,
            ephemeral: true
        });
    }
};

const getSpecificHolidayImagePath = (game, variant, customer, holidayNumber) => {
    const gameKey = variant ? `${game}_${variant}` : game;
    return `${baseUrl}/${gameKey}/${encodeURIComponent(customer)}/${encodeURIComponent(customer)}${holidayNumber}.png`;
};

// Define the slash command data (as before)
const commandData = new SlashCommandBuilder()
    .setName('order')
    .setDescription('Retrieve an order for a customer in a specific game.')
    .addStringOption(option =>
        option.setName('customer')
        .setDescription('The customer to retrieve the order for.')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('game')
        .setDescription('The game the order is from.')
        .setRequired(true)
        .addChoices({
            name: 'Pizzeria',
            value: 'pizzeria'
        }, {
            name: 'Burgeria',
            value: 'burgeria'
        }, {
            name: 'Taco Mia',
            value: 'tacomia'
        }, {
            name: 'Freezeria',
            value: 'freezeria'
        }, {
            name: 'Pancakeria',
            value: 'pancakeria'
        }, {
            name: 'Wingeria',
            value: 'wingeria'
        }, {
            name: 'Hot Doggeria',
            value: 'hotdoggeria'
        }, {
            name: 'Cupcakeria',
            value: 'cupcakeria'
        }, {
            name: 'Pastaria',
            value: 'pastaria'
        }, {
            name: 'Donuteria',
            value: 'donuteria'
        }, {
            name: 'Cheeseria',
            value: 'cheeseria'
        }, {
            name: 'Bakeria',
            value: 'bakeria'
        }, {
            name: 'Sushiria',
            value: 'sushiria'
        }, {
            name: 'Scooperia',
            value: 'scooperia'
        }, {
            name: 'Mocharia',
            value: 'mocharia'
        }, {
            name: 'Cluckeria',
            value: 'cluckeria'
        }, {
            name: 'Paleteria',
            value: 'paleteria'
        }))
    .addStringOption(option =>
        option.setName('variant')
        .setDescription('Specify the game variant (leave empty for desktop version).')
        .setRequired(false)
        .addChoices({
            name: 'HD',
            value: 'hd'
        }, {
            name: 'To Go!',
            value: 'togo'
        }, {
            name: 'Deluxe',
            value: 'deluxe'
        }))
    .addBooleanOption(option =>
        option.setName('holiday')
        .setDescription('Is this a holiday order?')
        .setRequired(false));

module.exports = {
    data: commandData,
    async execute(interaction) {
        const chalk = (await import('chalk')).default; // Use dynamic import here as well
        const customerInput = interaction.options.getString('customer').trim();
        const game = interaction.options.getString('game');
        const variant = interaction.options.getString('variant') || '';
        const isHoliday = interaction.options.getBoolean('holiday') || false;

        const formattedGameWithVariant = variant ? `${game}_${variant}` : game;

        console.log(chalk.blue(`Received order request: Customer: "${capitalize(customerInput)}", Game: ${formattedGameWithVariant}, Holiday: ${isHoliday}`));

        await interaction.deferReply();

        // Special check for Jojo
        if (customerInput.toLowerCase() === 'jojo') {
            await interaction.editReply(`**Jojo** orders something completely different every time he visits a shop.`);
            return;
        }

        let gameVariantPath;
        if (variant === 'togo' && ['mocharia', 'cluckeria', 'paleteria'].includes(game)) {
            gameVariantPath = game; // Use the base game path for holiday and regular orders
        } else {
            gameVariantPath = variant ? `${game}_${variant}` : game; // Default path for other games and variants
        }

        // Find the customer, or the closest match
        const validCustomer = customers.find(c => c.name.toLowerCase() === customerInput.toLowerCase());
        if (!validCustomer) {
            const closestMatch = findClosestCustomer(customerInput);
            const replyMessage = closestMatch ?
                `**${capitalize(customerInput)}** is not valid. Did you mean **${closestMatch}**?` :
                `**${capitalize(customerInput)}** is not a valid customer.`;
            await interaction.editReply(replyMessage);
            return;
        }

        console.log(chalk.green(`Valid customer found: ${validCustomer.name}`));

        // Check if the customer is a worker in the selected game
        const gameVariantKey = variant ? `${game}_${variant}` : game;
        if (workers[gameVariantKey]?.includes(validCustomer.value)) {
            await interaction.editReply(`**${capitalize(validCustomer.name)}** is a worker in **${formattedGameWithVariant}** and does not have an order.`);
            return;
        }

        // Construct the file path for orders
        const filePath = getOrderPath(formattedGameWithVariant, validCustomer.value.toLowerCase(), isHoliday);

        console.log(chalk.blue(`Looking for order file at: ${filePath}`));

        const fileExists = await checkFileExists(filePath);

        if (!fileExists) {
            const orderType = isHoliday ? 'a holiday order' : 'an order';
            await interaction.editReply(`**${capitalize(validCustomer.name)}** does not have ${orderType} available in **${formattedGameWithVariant}**.`);
            return;
        }

        console.log(chalk.green(`Order file found at: ${filePath}. Preparing response...`));

        // Handle holiday interactions with closers (remains the same)
        if (isHoliday && isCloser(gameVariantPath, validCustomer.value)) {
            console.log(chalk.cyan(`Handling holiday order for closer: ${validCustomer.name}`));

            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            // Function to create button rows for holidays
            const createButtonRow = () => {
                const actionRows = [];

                for (let i = 0; i < months.length; i += 5) {
                    const row = new ActionRowBuilder().addComponents(
                        months.slice(i, i + 5).map(month =>
                            new ButtonBuilder().setCustomId(month.toLowerCase()).setLabel(month).setStyle(ButtonStyle.Primary)
                        )
                    );
                    actionRows.push(row);
                }

                return actionRows;
            };

            let buttonRows = createButtonRow();

            if (buttonRows.length > 0) {
                const mainAttachment = new AttachmentBuilder(filePath);

                // Send initial message with the attachment and buttons
                console.log(chalk.green(`Displaying holiday buttons for ${validCustomer.name}`));
                await interaction.editReply({
                    content: `**Favorite Holiday**: All of them!`,
                    files: [mainAttachment],
                    components: buttonRows
                });

                const sentMessage = await interaction.fetchReply();
                console.log(chalk.blue(`Buttons displayed for ${validCustomer.name}. Waiting for interaction...`));

                // Set up a button collector
                const filter = (i) => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 60000 // 60-second timeout
                });

                collector.on('collect', async (i) => {
                    if (i.message.id !== sentMessage.id) {
                        console.log(chalk.yellow(`Interaction does not belong to this message. Ignoring button press for customer: ${capitalize(validCustomer.name)}`));
                        return;
                    }

                    console.log(chalk.green(`Button pressed by ${i.user.username} for month: ${i.customId}, customer: ${capitalize(validCustomer.name)}`));

                    if (!i.replied) {
                        await i.deferUpdate();
                        console.log(chalk.blue(`Deferred button interaction for month: ${i.customId}, customer: ${capitalize(validCustomer.name)}`));
                    }

                    const month = capitalize(i.customId);
                    const holidayNumber = getHolidayOrderNumber(gameVariantPath, month); // Calculate the holiday order number

                    console.log(chalk.blue(`Holiday Number calculated: ${holidayNumber}`));

                    // Use the correct casing for the customer name when constructing the path
                    const specificHolidayPath = `${baseUrl}/${gameVariantPath}/${encodeURIComponent(validCustomer.value)}/${encodeURIComponent(validCustomer.value)}${holidayNumber}.png`;

                    console.log(`Looking for specific holiday order file at: ${specificHolidayPath}`); // Log the specific path

                    // Check if the specific holiday order exists
                    const specificHolidayExists = await checkFileExists(specificHolidayPath);

                    if (specificHolidayExists) {
                        const holidayAttachment = new AttachmentBuilder(specificHolidayPath);
                        await i.followUp({
                            content: `**Holiday Order for ${capitalize(validCustomer.name)} in ${month}:**`,
                            files: [holidayAttachment],
                            ephemeral: true
                        });
                    } else {
                        await i.followUp({
                            content: `Holiday order for **${capitalize(validCustomer.name)}** in **${month}** is not available.`,
                            ephemeral: true
                        });
                    }
                });


                collector.on('end', () => {
                    console.log(chalk.blue(`Collector ended for customer: ${capitalize(validCustomer.name)}`));
                });
            } else {
                console.log(chalk.yellow(`No button rows created for ${validCustomer.name}.`));
            }
        } else if (isHoliday) {
            // Handle holiday for non-closers
            const favoriteHoliday = holidays[validCustomer.value]?.[formattedGameWithVariant] || 'Unknown Holiday';
            await interaction.editReply({
                content: `**Favorite Holiday**: ${favoriteHoliday}`,
                files: [new AttachmentBuilder(filePath)]
            });
        } else {
            console.log(chalk.cyan(`Sending regular order for: ${validCustomer.name}`));
            await interaction.editReply({
                files: [new AttachmentBuilder(filePath)]
            });
        }
    }
};