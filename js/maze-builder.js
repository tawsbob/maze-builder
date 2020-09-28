'use strict';

(function(){

	function MazeBuilder(){

		var mazeClass = this;

		//DEFAULTS CONFIGURATIONS
		this.mazeConfigs = {
			border: 0.5,
			borderColor: '#ff0000',
			roomWidth: 10,
			roomHeight: 10,
		}

		this.directions = {

			WEST: 	8,
			SOUTH: 	4,
			EAST: 	2,
			NORTH: 	1

		}


		//DEFAULT GRID 
		this.grid = [];

		//THIS GRID SERVES TO TRACK THE VISITED ROOM
		this.visitedGrid = [];


		this.MazeWidth 	= null;
		this.MazeHeight = null;

		this.totalRooms 		= null;
		this.totalRoomsVisited 	= 0;

		this.wayRecord 	= [];

		this.setGrid = function(row, col){

			for(var x=0; x<row; x++){

				var newRow 			= [];
				var newRowVisited 	= [];
				for(var y=0; y<col; y++){

					newRow.push(15);
					newRowVisited.push(0);

				}

				this.grid.push(newRow);
				this.visitedGrid.push(newRowVisited);

			}

			//UPDATE
			this.MazeWidth 	= this.grid[0].length;
			this.MazeHeight = this.grid.length;
			this.totalRooms = this.MazeWidth * this.MazeHeight;

		}


		this.getDirectionByName = function(name){

			if (this.direction[name]){

				return this.direction[name];

			} else {

				console.error('wrong direction name!');
				return false;

			}
			
		}

		this.getDirectionByValue = function(value){

			var directionName = false;

			for(var x in this.directions){

				if (this.directions[x] == value){

					directionName = x;
					break;

				}

			}

			return directionName;

		}

		//RETURN JUST THE AVALIABLE DIRECTION TO BREAK
		this.getRandomDirection = function(currentRoom, hasFiltredDirections, callback){

			var ignored 			= this.checkDirection(currentRoom.row, currentRoom.col);
			var directions 			= hasFiltredDirections || ['WEST', 'SOUTH', 'EAST', 'NORTH'];
			var selectedDirection 	= '';


			if (ignored.length){

			directions = directions.filter(function (currentValue, index, array) {

					if (!(ignored.indexOf( currentValue ) != -1)){

						 return currentValue;

					}

				});

			}

			selectedDirection = directions[Math.floor(Math.random()*directions.length)];

			if (callback) callback(this.directions[ selectedDirection ], directions);

		}



		this.getCurrentRoom = function(){

			if (this.wayRecord.length){

				return this.wayRecord[ this.wayRecord.length-1 ];

			} 


			return false;
		}


		//RETURN A RANDOM ROOM IN THE GRID
		this.chooseRandomRoom = function(callback){

			var selectedCol = Math.floor(Math.random()*this.MazeWidth);
			var selectedRow = Math.floor(Math.random()*this.MazeHeight);

			if(callback) callback(selectedRow, selectedCol, this.grid[selectedRow][selectedCol]);

			//return ;
		}

		//CHECK DIRECTION Bitwise logical operators
		this.checkDirection = function( rowIndex, colIndex ){

			var dontGo = [];

			//DO NOT BREAK WEST
			if (colIndex < 1 ) {
				//console.log('dont go W');
				dontGo.push('WEST');
			}

			//DO NOT BREAK EAST
			if (colIndex >= this.MazeWidth-1){
				//console.log('dont go E');
				dontGo.push('EAST');
			}

			//DO NOT BREAK NORTH
			if(rowIndex < 1){
				//console.log('dont go N');
				dontGo.push('NORTH');
			}

			//DO NOT BREAK SOUTH
			if(rowIndex >= this.MazeHeight-1){
				//console.log('dont go S');
				dontGo.push('SOUTH');
			} 

			//console.log('check: ' + rowIndex, colIndex, dontGo);

			return dontGo;

		}

		//SET VISITED ROOM
		this.setVisitedRoom = function(row, col){

			this.visitedGrid[row][col] = 1;
		}

		//CHECK IF NEIGHBOR ROOM ARE NOT VISITED
		this.checkNeighborRoom = function(rowIndex, colIndex){

			return ( this.visitedGrid[rowIndex][colIndex] == 0 );
		}

		this.findNeighborByDirection = function(row, col, direction, callback){

			switch(direction){

				//WEST
				case 8:
				col--;
				break;

				//SOUTH
				case 4:
				row++;
				break;

				//EAST
				case 2:
				col++;
				break;

				//NORTH
				case 1:
				row--;
				break;

				default:
				break;

			}


			var found = this.checkNeighborRoom( row, col );

			if(callback) callback(found, row, col);

			//return this.grid[row][col];

		}

		this.breakWallByDirection = function(row, col, direction){

			this.grid[row][col] = this.grid[row][col] - direction;

			//console.log('roomValue AfterBreak:' + this.grid[row][col]);
		}

		this.breakOpposedWall = function(row, col, direction){

			var opposedDirection = null;

			switch(direction){

				//WEST
				case 8:
				opposedDirection = 2;
				break;

				//SOUTH
				case 4:
				opposedDirection = 1;
				break;

				//EAST
				case 2:
				opposedDirection = 8;
				break;

				//NORTH
				case 1:
				opposedDirection = 4;
				break;

				default:
				break;
			}

			this.breakWallByDirection(row, col, opposedDirection);

		}

		this.testDirectionRecursively = function( currentRoom, hasFiltredDirections ){

			//console.log('filtred directions:' + hasFiltredDirections);

			mazeClass.getRandomDirection(currentRoom, hasFiltredDirections, function(randomDirection, possibleDirections){

				//console.log('randomDirection:' +randomDirection);

				mazeClass.findNeighborByDirection(currentRoom.row, currentRoom.col, randomDirection, function( foundUnVisited, neighborRow, neighborCol){

					if (foundUnVisited){

						mazeClass.breakWallByDirection(currentRoom.row, currentRoom.col, randomDirection);
						mazeClass.breakOpposedWall(neighborRow, neighborCol, randomDirection);
						mazeClass.setVisitedRoom(currentRoom.row, currentRoom.col);

						//SET CURRENT ROOM - THE LAST INDEX AWAYS IS THE CURRENT ROOM
						mazeClass.wayRecord.push({ row: neighborRow, col: neighborCol });
						
						mazeClass.totalRoomsVisited++;

					} else {

						//Try another direction if the randomDirection math with visited room;
						
						var visitedDirection = mazeClass.getDirectionByValue(randomDirection);

						if (possibleDirections.length){

							//Clean the array of the tested direction
							var filtredPossibleDirections = possibleDirections.filter(function(currentValue, index, arr){

									return !(currentValue == visitedDirection);
							});

							if (filtredPossibleDirections.length){
								
								mazeClass.testDirectionRecursively( currentRoom, filtredPossibleDirections  );

							} else {

								//console.log('1-valor da sala: ' + mazeClass.grid[currentRoom.row][currentRoom.col]);

								mazeClass.setVisitedRoom(currentRoom.row, currentRoom.col);
								//mazeClass.totalRoomsVisited++;
								mazeClass.wayRecord.pop();

							}

						} else {

							//console.log('2-valor da sala: ' + mazeClass.grid[currentRoom.row][currentRoom.col]);
							//GET ONE STEP BACK IF THERE IS NOT DIRECTION TO GO
							mazeClass.setVisitedRoom(currentRoom.row, currentRoom.col);
							//mazeClass.totalRoomsVisited++;
							mazeClass.wayRecord.pop();

						}


					}

				});

			});

		}

		this.buildMazeLoop = function(){

			var currentRoom = this.getCurrentRoom();
			
			if (currentRoom){
				this.testDirectionRecursively( currentRoom );
				//console.log('currentRoom: ' + currentRoom.row+' '+currentRoom.col +' currentWaylength: '+ mazeClass.wayRecord.length );

			}

			
		}

		this.buildMaze = function(setRow, setCol, callback){

			this.setGrid(setRow, setCol);

			this.chooseRandomRoom(function(row, col, currentRoom){
				

				mazeClass.wayRecord.push({ row: row, col: col });
				mazeClass.totalRoomsVisited++;

				while(mazeClass.totalRoomsVisited < mazeClass.totalRooms){

					mazeClass.buildMazeLoop();

				}


				//console.log(mazeClass.wayRecord)
				//mazeClass.debug();
				mazeClass.draw(callback);
			});

			
		}

		this.debug = function(){

			var htmlString = '<table border="0" cellspacing="0" cellpadding="0">';

			for(var x in this.grid){

				var row = this.grid[x];

				htmlString += '<tr>';

				for(var y in row){

					var col = row[y];

					//htmlString += '<td>' + col + '</td>';
					htmlString += '<td style="width:10px; height:10px; ' +  this.checkRoomConfig(col) + '"></td>';

				}

				htmlString += '</tr>';

			}

			htmlString += '</table><table border="1">';

			for(var x in this.visitedGrid){

				var row = this.visitedGrid[x];

				htmlString += '<tr>';

				for(var y in row){

					var col = row[y];

					htmlString += '<td>' + col + '</td>';

				}

				htmlString += '</tr>';

			}

			htmlString += '</table>';

			document.getElementById('debug').innerHTML = htmlString;

		}

		this.checkRoomConfig = function(room){

			var border = '';

			if (8 & room){ border+= 'border-left:1px solid ' + this.mazeConfigs.borderColor +';'; }
			if (4 & room){ border+= 'border-bottom:1px solid ' + this.mazeConfigs.borderColor +'; ';}
			if (2 & room){ border+= 'border-right:1px solid ' + this.mazeConfigs.borderColor +'; ';}
			if (1 & room){ border+= 'border-top:1px solid ' + this.mazeConfigs.borderColor +'; ';}

			return border;
		}

		//DRAW IN CANVAS THE CONFIG OF ROOM
		this.drawConfi = function(x,y,ctx,roomConfig){

			var startX = parseInt(x)*this.mazeConfigs.roomWidth + this.mazeConfigs.border;
			var startY = parseInt(y)*this.mazeConfigs.roomHeight + this.mazeConfigs.border;

			//WEST
			if (8 & roomConfig){

				ctx.moveTo(startX, startY);
				ctx.lineTo(startX, 	startY + this.mazeConfigs.roomHeight);
				ctx.stroke();
				
			}
			//SOUTH
			if (4 & roomConfig){

				ctx.moveTo(startX, startY+this.mazeConfigs.roomHeight);
				ctx.lineTo(startX + this.mazeConfigs.roomWidth, startY+this.mazeConfigs.roomHeight);
				ctx.stroke();

			}
			//EAST
			if (2 & roomConfig){

				ctx.moveTo(startX + this.mazeConfigs.roomWidth, startY);
				ctx.lineTo(startX + this.mazeConfigs.roomWidth, startY + this.mazeConfigs.roomHeight);
				ctx.stroke();

			}
			//NORTH
			if (1 & roomConfig){

				ctx.moveTo(startX, startY);
				ctx.lineTo(startX + this.mazeConfigs.roomWidth, startY);
				ctx.stroke();


			}


		}

		this.createCanvasElement = function(){

			var canvas = document.createElement("canvas");

			var canvasWidth 	= (this.mazeConfigs.roomWidth * this.MazeWidth) + this.mazeConfigs.border * 2;
			var canvasHeight 	= (this.mazeConfigs.roomHeight * this.MazeHeight) + this.mazeConfigs.border * 2;

			canvas.setAttribute( 'width', canvasWidth	);
			canvas.setAttribute( 'height', canvasHeight );
			//canvas.setAttribute( 'id','lab')


			return canvas;

		}

		this.draw = function(callback){

			var canvasElement 	= this.createCanvasElement(	);
			var ctx 			= canvasElement.getContext("2d");

			ctx.beginPath();

			ctx.lineWidth 	= this.mazeConfigs.border;
			ctx.strokeStyle = this.mazeConfigs.borderColor;

			for(var x in this.grid){
				var row = this.grid[x];

				for(var y in row){

					var col = row[y];

						this.drawConfi(y,x,ctx, col);

				}
			}

			document.getElementById('teste').appendChild(canvasElement);
			if (callback) {
				callback();
			}

		}


		this.setMarkerOn = function(x,y){

			
			
		}


	}


	var novoLab = new MazeBuilder();

		novoLab.buildMaze(22,20,function(){
			console.log(novoLab);
		});

})();