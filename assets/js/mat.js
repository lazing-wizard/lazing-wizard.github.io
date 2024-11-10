
// Matrix and vectors operations

// Vectors are represented vertically
// Transfromation vectors in matrix are represented vertically

/// Ineffective because of memory allocation and needs optimizing

function Mat(...args) {
    this.height = args[0];
    this.width = args[1];
    this.data = args.slice(2);
}

function mat(...args) {
    return new Mat(...args);
}
function vec1(...args) {
    if (args.length != 1) throw new Error('Incorrect values for vec1');
    return mat(1, 1, ...args);
}
function vec2(...args) {
    if (args.length != 2) throw new Error('Incorrect values for vec2');
    return mat(2, 1, ...args);
}
function vec3(...args) {
    if (args.length != 3) throw new Error('Incorrect values for vec3');
    return mat(3, 1, ...args);
}
function vec4(...args) {
    if (args.length != 4) throw new Error('Incorrect values for vec4');
    return mat(4, 1, ...args);
}
function mat1(...args) {
    if (args.length != 1) throw new Error('Incorrect values for mat1');
    return mat(1, 1, ...args);
}
function mat2(...args) {
    if (args.length != 4) throw new Error('Incorrect values for mat2');
    return mat(2, 2, ...args);
}
function mat3(...args) {
    if (args.length != 9) throw new Error('Incorrect values for mat3');
    return mat(3, 3, ...args);
}
function mat4(...args) {
    if (args.length != 16) throw new Error('Incorrect values for mat4');
    return mat(4, 4, ...args);
}

Mat.prototype.get = function(i, j) {
    if (i >= this.height) throw new Error('Height out of bounds in Mat get');
    if (j >= this.width) throw new Error('Width out ouf bounds in Mat get');
    return this.data[i * this.width + j];
}
Mat.prototype.set = function(i, j, v) {
    if (i >= this.height) throw new Error('Height out of bounds in Mat set');
    if (j >= this.width) throw new Error('Width out ouf bounds in Mat set');
    this.data[i * this.width + j] = v;
    return this;
}
Mat.prototype.x = function(arg) {
    if (this.width != 1) throw new Error('Calling x() on non vector');
    if (this.height < 1) throw new Error('Not high enough dimension for x()');
    if (arg) {
        this.data[0] = arg;
        return this;
    } else {
        return this.data[0];
    }
}
Mat.prototype.y = function(arg) {
    if (this.width != 1) throw new Error('Calling y() on non vector');
    if (this.height < 2) throw new Error('Not high enough dimension for y()');
    if (arg) {
        this.data[1] = arg;
        return this;
    } else {
        return this.data[1];
    }
}
Mat.prototype.z = function(arg) {
    if (this.width != 1) throw new Error('Calling z() on non vector');
    if (this.height < 3) throw new Error('Not high enough dimension for z()');
    if (arg) {
        this.data[2] = arg;
        return this;
    } else {
        return this.data[2];
    }
}
Mat.prototype.w = function(arg) {
    if (this.width != 1) throw new Error('Calling w() on non vector');
    if (this.height < 4) throw new Error('Not high enough dimension for w()');
    if (arg) {
        this.data[3] = arg;
        return this;
    } else {
        return this.data[3];
    }
}

Mat.prototype.add_number = function(n) {
    var temp = new Array(this.height * this.width);
    for (var i = 0; i < this.data.length; ++i) {
        temp[i] = this.data[i] + n;
    }
    return new Mat(this.height, this.width, ...temp);
}
Mat.prototype.add = function(m) {
    if (!(m instanceof Mat)) {
        return this.add_number(m);
    }
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat addition');
    }
    var temp = new Array(this.height * this.width);
    for (var i = 0; i < this.data.length; ++i) {
        temp[i] = this.data[i] + m.data[i];
    }
    return new Mat(this.height, this.width, ...temp);
}

Mat.prototype.sub_number = function(n) {
    var temp = new Array(this.height * this.width);
    for (var i = 0; i < this.data.length; ++i) {
        temp[i] = this.data[i] - n;
    }
    return new Mat(this.height, this.width, ...temp);
}
Mat.prototype.sub = function(m) {
    if (!(m instanceof Mat)) {
        return this.sub_number(m);
    }
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat subtraction');
    }
    var temp = new Array(this.height * this.width);
    for (var i = 0; i < this.data.length; ++i) {
        temp[i] = this.data[i] - m.data[i];
    }
    return new Mat(this.height, this.width, ...temp);
}
Mat.prototype.mul_number = function(n) {
    var temp = new Array(this.height * this.width);
    for (var i = 0; i < this.data.length; ++i) {
        temp[i] = this.data[i] * n;
    }
    return new Mat(this.height, this.width, ...temp);
}
// Matrix multiplication for "m" on the left, and "this" on the right
Mat.prototype.mul = function(m) {
    if (!(m instanceof Mat)) {
        return this.mul_number(m);
    }
    if (this.height != m.width) {
        throw new Error('Incorrect size for mat multiplication');
    }
    
    var new_width = this.width;
    var new_height = m.height;
    var temp = new Array(new_width * new_height);
            
    for (var i = 0; i < new_height; i++) {
        for (var j = 0; j < new_width; j++) {
            temp[i*new_width + j] = 0;
            for (var x = 0; x < m.width; x++) {
                temp[i*new_width + j] += m.data[i*m.width + x] * this.data[x*this.width + j];
            } 
        } 
    }
    return new Mat(new_height, new_width, ...temp);
}

// Columnwise normalization
Mat.prototype.normalize = function() {
    var temp = new Array(this.width * this.height);
    for (var j = 0; j < this.width; ++j) {
        var sum = 0;
        for (var i = 0; i < this.height; ++i) {
            sum += Math.pow(this.data[this.width*i + j], 2);
        }
        sum = Math.sqrt(sum);
        for (var i = 0; i < this.height; ++i) {
            temp[this.width*i + j] = this.data[this.width*i + j] / sum;
        }
    }
    return new Mat(this.height, this.width, ...temp);
}
Mat.prototype.transpose = function() {
    var temp = new Array(this.width * this.height);
    for (var j = 0; j < this.width; ++j) {
        for (var i = 0; i < this.height; ++i) {
            temp[this.width*i + j] = this.data[this.width*j + i];
        }
    }
    return new Mat(this.width, this.height, ...temp);
}
Mat.prototype.dot = function(v) {
    if (this.width != 1 || v.width != 1) throw new Error('Trying to dot multiply matrix');
    if (this.height != v.height) throw new Error('Trying to dot multiply vectors of different dimensions');
    let value = 0;
    for (var i = 0; i < this.height; ++i)
        value += this.data[i] * v.data[i];
    return value;
}
// Returns vector of this projected on v
Mat.prototype.project = function(v) {
    //let dir = v;
    //v = this;
    //let m = mat2(dir.x()*dir.x(), dir.x()*dir.y(),
    //             dir.y()*dir.x(), dir.y()*dir.y());
    //let m1 = mat2(dir.x(), dir.x(),
    //              dir.y(), dir.y());
    //let m2 = mat2(dir.x(), 0.0,
    //              0.0,     dir.y());
    //m = m2.mul(m1);
    //return v.mul(m).mul(1/pow(dir.length(), 2));
    return v.mul(this.dot(v)/v.dot(v));
}
// Returns vector of this rotated in direction of v 
Mat.prototype.align = function(v) {
    return v.mul(this.length()/v.length());
}
Mat.prototype.length = function() {
    if (this.width != 1) throw new Error('Trying to get length of non vector');
    let value = 0;
    for (var i = 0; i < this.height; ++i)
        value += this.data[i] * this.data[i];
    return Math.sqrt(value);
}
// Vertical dimension
Mat.prototype.vdim = function() {
    return this.height;
}
// Horizontal dimension
Mat.prototype.hdim = function() {
    return this.width;
}
