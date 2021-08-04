const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    let symbol = "Filler";
    let name = 'Awesome Star1';        
    await createTestStar(instance, name, symbol, tokenId, accounts[0]);
    let starInfo = await instance.tokenIdToStarInfo.call(tokenId)
    assert.equal(starInfo.name, name)
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starPrice = web3.utils.toWei(".01", "ether");
    let tokenId = 2;
    let symbol = "STAR";   
    let name = 'Awesome Star2';        
    await createTestStar(instance, name, symbol, tokenId, user1);
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(tokenId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let tokenId = 3;
    let symbol = "STAR";   
    let name = 'Awesome Star2';        
    await createTestStar(instance, name, symbol, tokenId, user1);    
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.approve(user2, tokenId, {from: user1, gasPrice: 0})
    await instance.buyStar(tokenId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let tokenId = 4;
    let symbol = "STAR";   
    let name = 'Awesome Star2';        
    await createTestStar(instance, name, symbol, tokenId, user1);    
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.approve(user2, tokenId, {from: user1, gasPrice: 0})
    await instance.buyStar(tokenId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 5;
    let symbol = "STAR";   
    let name = 'Awesome Star2';        
    await createTestStar(instance, name, symbol, tokenId, user1);    
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.approve(user2, tokenId, {from: user1, gasPrice: 0})
    await instance.buyStar(tokenId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let tokenId = 6;
    let symbol = "STAR";   
    let name = 'Awesome Star2';        
    await createTestStar(instance, name, symbol, tokenId, accounts[0]);      
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let star = await instance.tokenIdToStarInfo.call(tokenId);    
    assert.equal(star.symbol, symbol);
    assert.equal(star.name, name);
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    
    let tokenId1 = 991;
    let symbol1 = "STAR1";   
    let name1 = 'Awesome Star 1';        
    let user1 = accounts[1]
    await createTestStar(instance, name1, symbol1, tokenId1, user1); 

    let tokenId2 = 992;
    let symbol2 = "STAR2";   
    let name2 = 'Awesome Star 2';        
    let user2 = accounts[2]
    await createTestStar(instance, name2, symbol2, tokenId2, user2); 

    await instance.approve(user2, tokenId1, {from: user1});
    await instance.approve(user1, tokenId2, {from: user2});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2,  {from: user1});
    // 3. Verify the star owner changed.
    var newOwnerOfToken1 = await instance.ownerOf(tokenId1);
    var newOwnerOfToken2 = await instance.ownerOf(tokenId2);
    
    assert.equal(newOwnerOfToken1, user2);
    assert.equal(newOwnerOfToken2, user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lets a user lookUptokenIdToStarInfo by token id', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId = 99;
    let symbol = "STAR";   
    let name = 'Awesome Star';        
    await createTestStar(instance, name, symbol, tokenId, accounts[0]); 

    // 2. Call your method lookUptokenIdToStarInfo
    var returnedStarName = await instance.lookUptokenIdToStarInfo(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(returnedStarName, name)
});

async function createTestStar(instance, name, symbol, tokenId, account) {
    await instance.createStar(name, symbol, tokenId, {from: account}); 
}