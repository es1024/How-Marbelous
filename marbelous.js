var hex_ascii = false;
var no_nbsp = false;
var golfed = false;
var grid_active = true;
var src_changed = false;
var UNDO_MAX = 100;
window.onbeforeunload = function(){ return "Are you sure you want to leave this page?"; };

var CTypes = {
	NOTHING:		[0, 'nothing', /^(|\.\.|\s{2})$/, '..'],
	TRASHBIN:		[1, 'trashbin', /^\\\/$/, '\\/'],
	CLONER:			[2, 'cloner', /^\/\\$/, '/\\'],
	DEFLECT_L:		[3, 'deflector-left', /^\/\/$/, '//'],
	DEFLECT_R:		[4, 'deflector-right', /^\\\\$/, '\\\\'],
	INCREMENT:		[5, 'incrementor', /^\+\+$/, '++'],
	DECREMENT:		[6, 'decrementor', /^\-\-$/, '--'],
	PORTAL:			[7, 'portal', /^@[A-Z\d]$/, '@'],
	SYNCHRONISER:	[8, 'synchroniser', /^&[A-Z\d]$/, '&'],
	LESSTHAN:		[9, 'less-than', /^\<[A-Z\d]$/, '<'],
	GREATERTHAN:	[10,'greater-than', /^\>[A-Z\d]$/, '>'],
	EQUALTO:		[11,'equal-to', /^=[A-Z\d]$/, '='],
	RANDOM:			[12,'random', /^\?[A-Z\d\?]$/, '?'],
//	SUBROUTINE:		[13,'subroutine', 'S?'],
	INPUT:			[15,'input', /^\}[A-Z\d]$/, '}'],
	OUTPUT:			[16,'output', /^\{[A-Z\d\>\<]$/, '{'],
	TERMINATE:		[17,'terminate', /^!!$/, '!!'],
	HEXLITERAL:		[18,'hex-literal', /^[A-F\d]{2}$/, '??'],
	// must be manually created
	NAMEDSUBR:		[19,'subroutine', /^(?!x)x$/, '??'],
	LSHIFT:			[20,'left-shift', /^<<$/, '<<'],
	RSHIFT:			[21,'right-shift', /^>>$/, '>>'],
	BITCHECK:		[22,'bit-check', /^\^[0-7]$/, '^'],
	BITNOT:			[23,'bitwise-not', /^~~$/, '~~'],
	CONSTANT_ADD:	[24,'constant-add', /^\+[A-Z\d]$/, '+'],
	CONSTANT_SUB:	[25,'constant-sub', /^\-[A-Z\d]$/, '-'],
	STDIN:			[26,'stdin', /^\]\]$/, ']]'],
	INVALID: 		[99,'invalid', /^(?!x)x$/, '??'],
};
function Cell(text){
	var value = text.substr(1,1), type;
	if(text == '' || text.match(/^\s{2}$/)){
		this.type = CTypes.NOTHING;
		this.value = '';
		return;
	}
	if(text.match(CTypes.NOTHING[2])) type = CTypes.NOTHING;
	else if(text.match(CTypes.TRASHBIN[2])) type = CTypes.TRASHBIN;
	else if(text.match(CTypes.CLONER[2])) type = CTypes.CLONER;
	else if(text.match(CTypes.DEFLECT_L[2])) type = CTypes.DEFLECT_L;
	else if(text.match(CTypes.DEFLECT_R[2])) type = CTypes.DEFLECT_R;
	else if(text.match(CTypes.INCREMENT[2])) type = CTypes.INCREMENT;
	else if(text.match(CTypes.DECREMENT[2])) type = CTypes.DECREMENT;
	else if(text.match(CTypes.PORTAL[2])) type = CTypes.PORTAL;
	else if(text.match(CTypes.SYNCHRONISER[2])) type = CTypes.SYNCHRONISER;
	else if(text.match(CTypes.LESSTHAN[2])) type = CTypes.LESSTHAN;
	else if(text.match(CTypes.GREATERTHAN[2])) type = CTypes.GREATERTHAN;
	else if(text.match(CTypes.EQUALTO[2])) type = CTypes.EQUALTO;
	else if(text.match(CTypes.RANDOM[2])) type = CTypes.RANDOM;
	else if(text.match(CTypes.INPUT[2])) type = CTypes.INPUT;
	else if(text.match(CTypes.OUTPUT[2])) type = CTypes.OUTPUT;
	else if(text.match(CTypes.TERMINATE[2])) type = CTypes.TERMINATE;
	else if(text.match(CTypes.LSHIFT[2])) type = CTypes.LSHIFT;
	else if(text.match(CTypes.RSHIFT[2])) type = CTypes.RSHIFT;
	else if(text.match(CTypes.BITCHECK[2])) type = CTypes.BITCHECK;
	else if(text.match(CTypes.BITNOT[2])) type = CTypes.BITNOT;
	else if(text.match(CTypes.CONSTANT_ADD[2])) type = CTypes.CONSTANT_ADD;
	else if(text.match(CTypes.CONSTANT_SUB[2])) type = CTypes.CONSTANT_SUB;
	else if(text.match(CTypes.STDIN[2])) type = CTypes.STDIN;
	else if(text.match(CTypes.HEXLITERAL[2])) type = CTypes.HEXLITERAL, value = parseInt(text, 16); 
	else if(text.length == 1 && hex_ascii){
		type = CTypes.HEXLITERAL;
		if(no_nbsp && text == '\xA0')
			text = ' ';
		value = text.charCodeAt(0) % 256;
	}
	else type = CTypes.INVALID, value = text;
	this.type = type;
	this.value = value;
};
Cell.prototype.isValid = function(){
	return this.type == CTypes.INVALID;
}
Cell.isValid = function(string){
	var temp_cell = new Cell(string);
	return Cell.isValid();
};
Cell.prototype.getClass = function(){
	return 'cell-' + this.type[1];
};
Cell.prototype.toString = function(html){
	switch(this.type[0]){
		case CTypes.NOTHING[0]:
		case CTypes.TRASHBIN[0]:
		case CTypes.CLONER[0]:
		case CTypes.DEFLECT_L[0]:
		case CTypes.DEFLECT_R[0]:
		case CTypes.INCREMENT[0]:
		case CTypes.DECREMENT[0]:
		case CTypes.TERMINATE[0]:
		case CTypes.LSHIFT[0]:
		case CTypes.RSHIFT[0]:
		case CTypes.BITNOT[0]:
		case CTypes.STDIN[0]:
			return this.type[3];
		case CTypes.PORTAL[0]:
		case CTypes.SYNCHRONISER[0]:
		case CTypes.LESSTHAN[0]:
		case CTypes.GREATERTHAN[0]:
		case CTypes.EQUALTO[0]:
		case CTypes.RANDOM[0]:
		//case CTypes.SUBROUTINE[0]:
		case CTypes.INPUT[0]:
		case CTypes.OUTPUT[0]:
		case CTypes.BITCHECK[0]:
		case CTypes.CONSTANT_ADD[0]:
		case CTypes.CONSTANT_SUB[0]:
			return this.type[3] + this.value;
		case CTypes.HEXLITERAL[0]:
			if(hex_ascii && html) return String.fromCharCode(this.value);
			else return ('00'+this.value.toString(16)).substr(-2).toUpperCase();
		case CTypes.NAMEDSUBR[0]:
			return this.value.str.substr(this.value.offset, 2);
		case CTypes.INVALID[0]:
			return (".."+this.value).substr(-2);
	}
};
Cell.prototype.copy = function(other){
	if(this.type[0] != CTypes.NAMEDSUBR[0])
		this.type = other.type, this.value = other.value;
	else{
		this.type = CTypes.INVALID;
		for(var i = 0; i < this.value.cells.length; ++i){
			var ocell = this.value.cells[i];
			if(ocell == this) continue;
			ocell.type = CTypes.INVALID;
			ocell.copy(new Cell(ocell.value.str.substr(ocell.value.offset, 2)));
		}
		this.type = other.type;
		this.value = other.value;
	}
};

function Board(w, h, nm, i){
	this.cells = [];
	this.width = w;
	this.height = h;
	for(var i = 0; i < this.width; ++i){
		this.cells[i] = [];
		for(var j = 0; j < this.height; ++j)
			this.cells[i][j] = new Cell('..');
	}
	this.name = nm;
	this.id = i;
	this.comment = null;
	this.rowcomments = [];
	for(var i = 0; i < this.height; ++i)
		this.rowcomments[i] = null;
	this.inputs = 0;
	this.outputs = 0;
};
Board.prototype.copy = function(other){
	this.width = other.width;
	this.height = other.height;
	this.cells = [];
	for(var i = 0; i < other.width; ++i){
		this.cells[i] = [];
		for(var j = 0; j < other.height; ++j){
			this.cells[i][j] = new Cell('..');
			this.cells[i][j].copy(other.cells[i][j]);
		}
	}
	this.name = other.name;
	this.id = other.id;
	this.comment = other.comment;
	this.rowcomments = [];
	$.extend(true,this.rowcomments,other.rowcomments);
	this.inputs = other.inputs;
	this.outputs = other.outputs;
};
Board.prototype.getName = function(){
	return this.name;
};
Board.prototype.getID = function(){
	return this.id;
};
Board.prototype.getHeight = function(){
	return this.height;
};
Board.prototype.getWidth = function(){
	return this.width;
};
Board.prototype.getComments = function(){
	return this.comment;
};
Board.prototype.getRowComments = function(row){
	return this.rowcomments[row];
};
Board.prototype.getInputs = function(){
	return this.inputs;
};
Board.prototype.getOutputs = function(){
	return this.outputs;
};
Board.prototype.setComments = function(comment){
	this.comment = comment;
};
Board.prototype.setRowComments = function(row, comment){
	this.rowcomments[row] = comment;
}
Board.prototype.toString = function(comments){
	if(typeof comments == "undefined") comments = true;
	var out = '';
	for(var j = 0; j < this.height; ++j){
		for(var i = 0; i < this.width; ++i){
			out += this.cells[i][j].toString(false) + ' ';
		}
		if(comments && this.getRowComments(j) != null)
			out += '# ' + this.getRowComments(j);
		out += '\n';
	}
	return out;
};
// todo: add comments to html
Board.prototype.toHTML = function(){
	var table = document.createElement('table');
	for(var j = 0; j < this.height; ++j){
		var row = document.createElement('tr');
		row.setAttribute('data-row', j);
		for(var i = 0; i < this.width; ++i){
			var td = document.createElement('td');
			var div = document.createElement('div');
			div.setAttribute('id', 'cell-'+j+'-'+i);
			div.setAttribute('data-row', j);
			div.setAttribute('data-col', i);
			div.setAttribute('class', this.cells[i][j].getClass());
			div.setAttribute('contenteditable',false);
			div.appendChild(document.createTextNode(this.cells[i][j].toString(true)));
			td.appendChild(div);
			row.appendChild(td);
		}
		table.appendChild(row);
	}
	return table;
};
Board.prototype.get = function(x,y){
	if(0 <= x && x <= this.height && 0 <= y && y <= this.width)
		return this.cells[y][x];
	else return null;
};
Board.prototype.set = function(x,y,val){
	if(0 <= x && x <= this.height && 0 <= y && y <= this.width){
		var a = this.cells[y][x].copy(val);
		this.recalculateIO();
		return a;
	}else return null;
};
Board.prototype.recalculateIO = function(){
	var inp = 0, out = 0;
	for(var i = 0; i < this.width; ++i){
		for(var j = 0; j < this.height; ++j){
			switch(this.cells[i][j].type[0]){
				case CTypes.INPUT[0]:
					inp = Math.max(inp, parseInt(this.cells[i][j].value) + 1);
				break;
				case CTypes.OUTPUT[0]:
					// special cases: < and >
					if(this.cells[i][j].value.match(/^[A-Z\d]$/))
						out = Math.max(out, parseInt(this.cells[i][j].value) + 1);
				break;
			}
		}
	}
	this.inputs = inp;
	this.outputs = out;
};
function parseBoard(lines, name, index){
	lines = lines.map(function(s){ return s.trim(); });
	var h, w = 0;
	for(h = 0; h < lines.length; ++h){
		lines[h] = lines[h].split(/#(.*)/).map(function(s){ return s.trim(); });
		lines[h][0] = lines[h][0].match(/(\S{2})/g);
		w = Math.max(lines[h][0].length, w);
	}
	
	var board = new Board(w, h, name, index);
	for(var i = 0, j; i < lines.length; ++i){
		for(j = 0; j < lines[i][0].length; ++j)
			board.set(i,j,new Cell(lines[i][0][j]));
		for(; j < w; ++j)
			board.set(i,j,new Cell('..'));
		if(lines[i].length > 1)
			board.setRowComments(i, lines[i][1]);
	}
	return board;
}
// does not handle subroutines
function parseBoards(string){
	var lines = (':MB\n'+string.trim()).replace(/^\s*[\r\n]/gm,'').split('\n').map(function(s){ return s.trim(); });
	var boards = [];
	
	var comments = [], boardstart = [];
	for(var i = 0; i < lines.length; ++i)
		if(lines[i][0] == ':') boardstart[boardstart.length] = i, comments[i] = false;
		else if(lines[i][0] == '#') comments[i] = true;
		else comments[i] = false;

	var bnames = [];
	// get all board names
	for(var i = 0; i < boardstart.length; ++i)
		bnames[bnames.length] = lines[boardstart[i]].substr(1).split('#')[0].trim();
	
	for(var i = boardstart.length, j = lines.length - 1; i--; ){
		var pos = boardstart[i];
		// Collect all non-line comments and remove from lines array
		var bcomment = "";
		for(; j > pos; --j){
			if(comments[j]){
				bcomment = lines[j].substr(1) + '\n' + bcomment;
				lines.splice(j, 1);
			}
		}
		if(lines[j].indexOf('#') != -1)
			bcomment = lines[j].split(/#(.*)/)[1].trim() + '\n' + bcomment;
		lines.splice(j--, 1);
		for(; comments[j] && j > 0; --j){
			bcomment = lines[j].split(/#(.*)/)[1].trim() + '\n' + bcomment;
			lines.splice(j, 1);
		}
		bcomment = bcomment.trim();
		// j now points to the start of the board information
		boards[i] = parseBoard(lines.splice(j+1), bnames[i], i);
		if(bcomment != "")
			boards[i].setComments(bcomment);
	}
	return boards;
}

var undo_history = [[new Board()]], undo_pos = -1;
var boards = [new Board(10, 14, 'MB', 0)];
var active_board = 0;
var active_tile = [0, 0];
var selected_tiles = [];
undo_history[0][0].copy(boards[0]);
// undo_pos: next to undo
// undo_pos + 1: current/next redo

function undo(){
	if(undo_history.length && undo_pos > -1){
		// swap current history with current board and move pointer
		var tmp = undo_history[undo_pos];
		undo_history[undo_pos] = boards;
		boards = tmp;
		--undo_pos;
	}
}
function redo(){
	if(undo_history.length > undo_pos + 2){
		++undo_pos;
		var tmp = undo_history[undo_pos];
		undo_history[undo_pos] = boards;
		boards = tmp;
	}
}
function saveUndo(){
	// delete all redo history
	while(undo_history.length > undo_pos + 2)
		undo_history.pop();
	var copy = [];
	for(var i = 0; i < boards.length; ++i)
		copy[i] = new Board(), copy[i].copy(boards[i]);

	undo_history.push(copy);
	// check max length
	if(undo_history.length > UNDO_MAX)
		undo_history.shift();
	undo_pos = undo_history.length - 2;
}

function focus_tile(i,j,clear_selected){
	if(typeof clear_selected == 'undefined')
		clear_selected = true;
	if(clear_selected)
		for(var q = selected_tiles.length; q--; )
			select_tile(selected_tiles[q][0],selected_tiles[q][1]);
	var tile = $('#cell-'+active_tile[0]+'-'+active_tile[1]);
	if(tile.is(':focus'))
		tile.blur(), tile=$('#cell-'+active_tile[0]+'-'+active_tile[1]);
	tile.removeClass('focused');
	if(!tile.hasClass('selected'))
		tile.draggable('disable');
	active_tile = [parseInt(i),parseInt(j)];
	tile = $('#cell-'+active_tile[0]+'-'+active_tile[1]);
	tile.addClass('focused');
	tile.draggable('enable');
}
function select_tile(i,j,update){
	if(typeof update == 'undefined')
		update = false;
	var q;
	for(q = selected_tiles.length; q--; )
		if(selected_tiles[q][0] == i && selected_tiles[q][1] == j)
			break;
	i = parseInt(i), j = parseInt(j);
	if(q != -1 && !update){
		selected_tiles.splice(q, 1);
		$('#cell-'+i+'-'+j).removeClass('selected').draggable('disable');
	}else{
		$('#cell-'+i+'-'+j).addClass('selected').draggable('enable');
		if(!update)
			selected_tiles[selected_tiles.length] = [i, j];
	}
}

// updates subroutine cell info
function updateSubroutine(){
	var subroutines = [];
	for(var i = boards.length; i--; ){
		subroutines[i] = {};
		subroutines[i].size = Math.max(1,boards[i].getInputs(),boards[i].getOutputs());
		// set .name to repeated name, filling up 2*.size chars
		subroutines[i].name = new Array(2*subroutines[i].size + 1).join(boards[i].getName()).substr(0,2*subroutines[i].size);
	}
	subroutines.sort(function(a,b){
		return a.size - b.size;
	});
	for(var i = boards.length; i--; ){
		// get board as a string w/o comments
		var bs = boards[i].toString(false).replace(/ /g, '').split('\n');
		for(var j = bs.length; j--; ){
			for(var k = subroutines.length; k--; ){
				var ind = bs[j].indexOf(subroutines[k].name);
				if(ind != -1 && !(ind % 2)){
					ind /= 2;
					
					var arr = [];
					for(var q = 0; q < subroutines[k].size; ++q)
						arr[arr.length] = boards[i].cells[ind+q][j];
					for(var q = 0; q < subroutines[k].size; ++q){
						arr[q].type = CTypes.NAMEDSUBR;
						arr[q].value = { cells: arr, str: subroutines[k].name, offset: 2*q };
					}
					
					bs[j]=bs[j].replace(subroutines[k].name, new Array(subroutines[k].name.length+1).join(' '));
					++k; // allow for this name to be searched again
				}
			}
		}
	}
}
// sets up grid handlers
function gridHandlers(){
	$('td>div').on('click', function(e){
		if($(this).hasClass('noclick')){
			$(this).removeClass('noclick');
			return;
		}
		if(e.ctrlKey || e.metaKey){
			if(!$('#cell-'+active_tile[0]+'-'+active_tile[1]).hasClass('selected'))
				select_tile(active_tile[0], active_tile[1]);
			select_tile($(this).attr('data-row'), $(this).attr('data-col'));
		}else if($(this).hasClass('focused'))
			$(this).attr('contenteditable', true).focus();
		else
			focus_tile($(this).attr('data-row'), $(this).attr('data-col'), !(e.ctrlKey || e.metaKey));
	}).on('focus', function(){
		if($(this).text() == '..') $(this).text('');
	}).on('blur', function(){
		var $this = $(this);
		if($this.text() == '\xA0\xA0') $this.text('');
		if($this.text().length > 2)
			$this.text($this.text().substr(0, 2));
		var row = $this.attr('data-row'), col = $this.attr('data-col');
		var newcell = new Cell($this.text()), newstring = newcell.toString(true);
		if(newstring != boards[active_board].get(row, col)){
			boards[active_board].set(row, col, newcell);
			$this.removeClass().addClass(boards[active_board].get(row, col).getClass());
			updateSubroutine();
			saveUndo();
			redrawGrid();
		}
		$this.attr('contenteditable',false);
	}).draggable({
		containment: $('table'),
		start: function(event, ui){
			$(this).addClass('noclick');
			focus_tile($(this).attr('data-row'),$(this).attr('data-col'),false);
			if(!$(this).hasClass('selected'))
				select_tile($(this).attr('data-row'),$(this).attr('data-col'));
		},
		drag: function(event, ui){
			for(var i = selected_tiles.length; i--; )
				$('#cell-'+selected_tiles[i][0]+'-'+selected_tiles[i][1]).css({
					top: ui.position.top,
					left: ui.position.left,
				});
		},
		stop: function(event, ui){
			// 40px cells
			// find cell displacement; truncated division
			// +20: move if halfway to next cell
			var calc_disp = function(p){
				return ((p+20*Math.abs(p)/p)/40)|0;
			};
			var x_disp = calc_disp(ui.position.left);
			var y_disp = calc_disp(ui.position.top);
			var clamp = function(a,min,max){
				return Math.min(Math.max(a,min),max);
			};
			// save moved data
			var tmp = [];
			for(var i = selected_tiles.length; i--; ){
				var tile = $('#cell-'+selected_tiles[i][0]+'-'+selected_tiles[i][1]);
				var x = parseInt(tile.attr('data-col')),
					y = parseInt(tile.attr('data-row'));
				var tmpcell = new Cell('..');
				$.extend(tmpcell, boards[active_board].get(y,x));
				boards[active_board].set(y,x,new Cell('..'));
				tmp[tmp.length] = [x, y, tmpcell];
				// update selected
				selected_tiles[i][0] = clamp(selected_tiles[i][0]+y_disp, 0, boards[active_board].getHeight() - 1);
				selected_tiles[i][1] = clamp(selected_tiles[i][1]+x_disp, 0, boards[active_board].getWidth() - 1);
			}
			// update active
			active_tile[0] = clamp(active_tile[0]+y_disp, 0, boards[active_board].getHeight() - 1);
			active_tile[1] = clamp(active_tile[1]+x_disp, 0, boards[active_board].getWidth() - 1);
			// update new cells
			for(var i = tmp.length; i--; )
				boards[active_board].set(
					clamp(tmp[i][1]+y_disp, 0, boards[active_board].getHeight() - 1),
					clamp(tmp[i][0]+x_disp, 0, boards[active_board].getWidth() - 1),
					tmp[i][2]
				);
			saveUndo(); // check if necessary?
			redrawGrid();
		},
	}).draggable('disable');
}

function redrawGrid(){
	$('#container').empty()[0].appendChild(boards[active_board].toHTML());
	gridHandlers();
	for(var i = selected_tiles.length; i--; )
		select_tile(selected_tiles[i][0],selected_tiles[i][1],true);
	focus_tile(active_tile[0], active_tile[1], false);
}
function redrawSource(){
	src_changed = false;
	var src = '';
	if(!golfed && boards[0].getComments() != null){
		var r = boards[0].getComments().split('\n').splice(-1);
		for(var j = 0; j < r.length; j++)
			src += '# ' + r[j] + '\n';
	}
	var appendBoard = function(src, i){
		var bsrc = boards[i].toString();
		if(golfed){
			// strip row comments, spaces, trailing `..`
			bsrc = bsrc.replace(/#.*(\s)/g, '$1')
					   .replace(/ /g, '')
					   .replace(/\.+(\s)/g, '$1')
			// remove all leading lines; replace other blank lines with `..`
					   .replace(/^\s*/m, '')
			// twice to ensure all instances are replaced.
					   .replace(/(\s)(\s)/mg, '$1..$2')
					   .replace(/(\s)(\s)/mg, '$1..$2')
		}
		return src+bsrc;
	};
	src = appendBoard(src, 0);
	for(var i = 1; i < boards.length; ++i){
		src += "\n";
		if(!golfed && boards[i].getComments() != null){
			var r = boards[i].getComments().split('\n');
			for(var j = 0; j < r.length; j++)
				src += '# ' + r[j].trim() + '\n';
		}
		src += ':' + boards[i].getName() + '\n';
		src = appendBoard(src, i);
	}
	var textarea = document.createElement('textarea');
	textarea.setAttribute('id','marbelous-source');
	textarea.value = src;
	var heading = document.createElement('h2');
	heading.appendChild(document.createTextNode('Marbelous Source'));
	$('#container').empty()[0].appendChild(heading);	
	$('#container')[0].appendChild(textarea);
	$('#marbelous-source').on('change', function(){
		src_changed = true;
	});
}
function gridDocHandler(){
	$(document).on('keydown', function(e){
		var code = e.which;
		var row = active_tile[0], col = active_tile[1];
		// shift+tab: reverse
		if(code == 9 && e.shiftKey) code = -1;
		switch(code){
			case 13: // enter
				var p = $('#cell-'+row+'-'+col);
				if(p.is(':focus')) p.blur();
				else p.click();
			break;
			case -1: // shift+tab
				if(col == 0 && row > 0)
					--row, col = boards[active_board].getWidth();
			case 37: // left
				if(col > 0){
					focus_tile(row, col-1, false);
					// if ctrl, select current
					if(e.ctrlKey || e.metaKey) select_tile(row, col);
				}
			break;
			case 38: // up
				if(row > 0){
					focus_tile(row-1, col, false);
					// if ctrl, select current
					if(e.ctrlKey || e.metaKey) select_tile(row, col);
				}
			break;
			case 9: // tab
				if(col == boards[active_board].getWidth() - 1 && row < boards[active_board].getHeight() - 1)
					++row, col = -1;
			case 39: // right
				if(col < boards[active_board].getWidth() - 1){
					focus_tile(row, col+1, false);
					// if ctrl, select current
					if(e.ctrlKey || e.metaKey) select_tile(row, col);
				}
			break;
			case 40: // down
				if(row < boards[active_board].getHeight() - 1){
					focus_tile(row+1, col, false);
					// if ctrl, select current
					if(e.ctrlKey || e.metaKey) select_tile(row, col);
				}
			break;
			case 90: // z
				if(e.ctrlKey || e.metaKey){ // control+z undo
					undo(); updateSubroutine(); redrawGrid();
				}
			break;
			case 89: // y
				if(e.ctrlKey || e.metaKey){ // control+y redo
					redo(); updateSubroutine(); redrawGrid();
				}
			break;
			case 8: // backspace
			case 46: // delete
				boards[active_board].set(row, col, new Cell('..'));
				saveUndo(); updateSubroutine(); redrawGrid();
			break;
		}
		if(code == 13 || code == 9 || code == -1){
			e.preventDefault();
			return false;
		}
	}).on('keypress', function(e){
		if(!e.ctrlKey && !e.altKey && !e.metaKey){
			//var c = String.fromCharCode(e.which);
			var row = active_tile[0], col = active_tile[1];
			//if(c.match(/^[A-Z\d\\\/\+\-=#]$/i))
			if($('#cell-'+row+'-'+col).attr('contenteditable') == 'false'){
				focus_tile(row, col, true);
				$('#cell-'+row+'-'+col).attr('contenteditable', true).focus();
			}
		}
	});
}
function srcDocHandler(){
	$(document).off('keydown').off('keyup');
}

$(document).ready(function(){
	redrawGrid();
	gridDocHandler();
	focus_tile(0,0);
	$('#hex_ascii').on('change', function(){
		hex_ascii = $(this).is(':checked');
		redrawGrid();
	});
	$('#no_nbsp').on('change', function(){
		no_nbsp = $(this).is(':checked');
		redrawGrid();
	});
	$('#compact').on('change', function(){
		golfed = $(this).is(':checked');
		if(src_changed)
			boards = parseBoards($('#marbelous-source').val());
		redrawSource();
	}).attr('disabled', true);;
	$('#grid_source_toggle').on('click', function(){
		if(grid_active){
			srcDocHandler();
			redrawSource();			
			$('#hex_ascii').attr('disabled', true);
			$('#no_nbsp').attr('disabled', true);
			$('#compact').attr('disabled', false);
			$('#active_board').attr('disabled', true);
			//$('#new_board').attr('disabled', true);
			$('#grid_source_toggle').val('View Marbelous Board');
		}else{ 
			gridDocHandler();
			if(src_changed){
				// todo: check if failed
				if($('#marbelous-source').val().trim() == ""){
					alert('No board detected in marbelous source!');
					return;
				}
				var bs_new = parseBoards($('#marbelous-source').val());
				if(bs_new.length == 0){
					alert('No board detected in marbelous source!');
					return;
				}
				boards = bs_new;
				updateSubroutine();
			}
			$('#hex_ascii').attr('disabled', false);
			$('#no_nbsp').attr('disabled', false);
			$('#compact').attr('disabled', true);
			$('#active_board').attr('disabled', false);
			//$('#new_board').attr('disabled', false);
			$('#grid_source_toggle').val('View Marbelous Source');
			
			// refresh board list
			$('#active_board').empty();
			for(var i = 0; i < boards.length; ++i){
				var opt = document.createElement('option');
				opt.value = i;
				var txt = boards[i].getName() + ' (' + ('00'+i).substr(-2) + ')';
				opt.appendChild(document.createTextNode(txt));
				$('#active_board')[0].appendChild(opt);
			}
			
			active_board = 0;
			saveUndo();
			redrawGrid();
		}
		grid_active = !grid_active;
	});
	$('#active_board').on('change', function(){
		var nactive = $(this).val();
		if(nactive >= 0 && nactive < boards.length){
			active_board = nactive;
			redrawGrid();
		}
	});
});
