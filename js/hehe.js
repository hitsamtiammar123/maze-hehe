(function(){
    var $window= $(window);
    var $view= $('#view');
    var $nav= $('#nav');
    var $btnGenerate = $('#btn-generate')

    var window_height=$window.height();
    var num_col=60;
    var num_row=17;
    var c_direction={
        up:{i:-1,j:0},
        down:{i:1,j:0},
        left:{i:0,j:-1},
        right:{i:0,j:1}
    };
    

    var nav_height=Number($nav.css('min-height').replace('px',''));
    var nav_margin_bottom=Number($nav.css('margin-bottom').replace('px',''));
    var view_height=window_height-nav_height-nav_margin_bottom;
    var isSPPlayingAnim=false;
    var hasCalledSP=false;

    $view.css('height',view_height+'px')

    var c_width=100/num_col;
    var step = 0;
    var c_height='35px';
    var col,row,curr,d,f,f_col,f_row,f_curr;
    window.nodes=[];

    function generateCoor(){
        var c_col=Math.floor(Math.random()*num_col);
        var c_row=Math.floor(Math.random()*num_row);

        return {
            col:c_col,row:c_row
        }
    }

    function putCharacters(){
        var css1={
            margin:'30% 5%',
            'font-size':'15px',
            'font-weight':'bold'
        }

        var css2={
            'font-size':'15px',
            'font-weight':'bold'
        }


        d=$('<div>');
        d.html('&#128561');
        d.css(css1);
        col=0;
        row=0;

        f=$('<div>');
        f.html('&#128536');
        f.css(css1);
        f_col=num_col-1;
        f_row=num_row-1;
    
        curr=nodes[row][col].node;
        curr.html(d);

        f_curr=nodes[f_row][f_col].node;
        f_curr.html(f);
    }

    function generateNodeVertex(col,row){
        var result=[];
        for(var i=0;i<num_row;i++){
            for(var j=0;j<num_col;j++){
                var obj={};
                obj.known=false;
                obj.cost=i===row && j===col?0:Infinity;
                obj.path=null;
                obj.i=i;
                obj.j=j;
                result.push(obj);
            }
        }
        return result;
    }

    function initNodes(){
        $view.html('');
        nodes=[];
        for(var i=0;i<num_row;i++){
            var $chunk=$('<div>')
            $chunk.css({width:'100%', float:'left'});
            var nodes2=[];
            for(var j=0;j<num_col;j++){
                var $chunk2=$('<div>');
                var node={};
                node.direction={
                    up:false,
                    down:false,
                    right:false,
                    left:false
                }
                $chunk2.css({
                    height:c_height,
                    width:c_width+'%',
                    'background-color':'lightgrey',
                    float:'left',
                    'border-top':'1px solid black',
                    'border-bottom':'1px solid black',
                    'border-left':'1px solid black',
                    'border-right':'1px solid black'
                });
                node.node=$chunk2;
                node.i=i;
                node.j=j;
                nodes2.push(node);
                $chunk.append($chunk2)
            }
            nodes.push(nodes2);
            $view.append($chunk);
        }
    }

    function onKeyUp(e){
        var code=e.key;
        var n=nodes[row][col];
        var validD=true;

        if(isSPPlayingAnim)
            return;

        switch(code){
            case 'ArrowUp':
                if(n.direction.up)
                    row!==0?row--:null;
                else
                    validD=false;
            break;
            case 'ArrowDown':
                if(n.direction.down)
                    row!==num_row-1?row++:null;
                else
                    validD=false;
            break;
            case 'ArrowLeft':
                if(n.direction.left) 
                    col!==0?col--:null;
                else
                    validD=false;
            break;
            case 'ArrowRight':
                if(n.direction.right)
                    col!==num_col-1?col++:null;
                else
                    validD=false;
            break;
        }

        
        if(validD){
            curr.html('');
            step++;
            if(step === 30){
                $btnGenerate.css('display', 'block');
            }
            curr=nodes[row][col].node;
            if(nodes[row][col].isSP){
                curr.css('background-color','lightgrey');
            }

            if(row===f_row && col===f_col ){
                var r=confirm('Hehehe Kamu menang, mau main lagi?');
                if(r){
                    makeGame();
                }
                else{
                    $view.html('<h1>You Win</h1>')
                }
            }
            else
                curr.html(d);
        }
    }

    function pushIfNotExists(node,arr){
        var check=checkNodes(node,arr);
        if(!check){
            arr.push(node);
        }
    }

    function checkNodes(node,listNodes){
        var check=listNodes.find((a)=>a===node);
        if(check)
            return true;
        return false;
    }

    function getPossibleNode(node,visitedNodes,doneNodes){
        var listNodes=[];
        var curr_i=node.i;
        var curr_j=node.j;

        for(var i in c_direction){  
            var direction=c_direction[i];
            var next_i=curr_i+direction.i;
            var next_j=curr_j+direction.j;
            var next_node=nodes[next_i]?nodes[next_i][next_j]:null;
            if(next_node && !checkNodes(next_node,visitedNodes) && !checkNodes(next_node,doneNodes)){
                listNodes.push({direction:i,node:next_node})
            }
        }

        return listNodes;

    }

    function getRandomPossibleNodes(nodes){

        if(nodes.length===1)
            return nodes[0];
        else{
            var randomIndex=Math.floor(Math.random()*nodes.length);
            return nodes[randomIndex];
        }
    }


    function setPath(curr_node,n_node_obj){
        var direction=n_node_obj.direction;
        var next_node=n_node_obj.node;
        switch(direction){
            case 'up':
                next_node.node.css('border-bottom','none');
                curr_node.node.css('border-top','none');

                curr_node.direction.up=true;
                next_node.direction.down=true;
            break;
            case 'down':
                next_node.node.css('border-top','none');
                curr_node.node.css('border-bottom','none');

                curr_node.direction.down=true;
                next_node.direction.up=true;
            break;
            case 'left': 
                next_node.node.css('border-right','none');
                curr_node.node.css('border-left','none');

                curr_node.direction.left=true;
                next_node.direction.right=true;
            break;
            case 'right':
                next_node.node.css('border-left','none');
                curr_node.node.css('border-right','none');

                curr_node.direction.right=true;
                next_node.direction.left=true;
            break;
        }
    }

    function generateMaze(){
        var coord=generateCoor();
        var m_col=coord.col;
        var m_row=coord.row;
        var visitedNodes=[];
        var doneNodes=[];
        var m_curr=nodes[m_row][m_col];
        var totalNodes=num_row*num_col;

        do{
            if(!checkNodes(m_curr,doneNodes))
                pushIfNotExists(m_curr,visitedNodes);

            var listPossibleNodes=getPossibleNode(m_curr,visitedNodes,doneNodes);
            if(listPossibleNodes.length!==0){
                var n_node_obj=getRandomPossibleNodes(listPossibleNodes);
                setPath(m_curr,n_node_obj);
                m_curr=n_node_obj.node;
            }
            else{
                pushIfNotExists(m_curr,doneNodes);
                visitedNodes.pop();
                m_curr=visitedNodes.pop();
            }

        }while(doneNodes.length!==totalNodes)

    }

    function findVertex(vertices,i,j){
        return vertices.find(v=>v.i===i && v.j===j );
    }

    function getCheapestVertex(vertices){
        var cost=Infinity;
        var v=null;
        var cheapest_vertex=null;

        for(var i=0;i<vertices.length;i++){
            v=vertices[i];
            if(v.cost<cost && v.known===false ){
                cost=v.cost;
                cheapest_vertex=v;
            }
        }
        return cheapest_vertex;
    }

    function getNeighboors(curr_vertex,vertices){
        var listVertices=[];
        var curr_node=nodes[curr_vertex.i][curr_vertex.j];
        for(var i in c_direction){
            var dir=c_direction[i];
            var next_i=curr_vertex.i+dir.i;
            var next_j=curr_vertex.j+dir.j;
            var next_node=nodes[next_i]?nodes[next_i][next_j]:null;
            var next_vertex=findVertex(vertices,next_i,next_j);
            if((next_node && curr_node.direction[i]) && (next_vertex && next_vertex.known===false )){
                next_vertex.dir=i;
                listVertices.push(next_vertex);
            }
        }
        return listVertices;
    }


    function startMakeSPWithAnimation(destination_vertex,vertices){
        var curr=destination_vertex;

        var sp_in=setInterval(function(){
            var path=curr.path;
            var node=nodes[curr.i][curr.j];
            var node_dom=node.node;
            node.isSP=true;
            if((node.i===row && node.j===col) ||  (node.i===f_row && node.j===f_col))
                node_dom.css('background-color','lightgrey');
            else
                node_dom.css('background-color','#8ddba1');

            if(path)
                curr=findVertex(vertices,path.i,path.j);
            else{
                clearInterval(sp_in);
                isSPPlayingAnim=false;
            }

        },10);
        isSPPlayingAnim=true;
    }

    function startMakeSP(destination_vertex,vertices){
        var curr=destination_vertex;

        while(curr){
            var path=curr.path;
            var node=nodes[curr.i][curr.j];
            var node_dom=node.node;
            node.isSP=true;
            if((node.i===row && node.j===col) ||  (node.i===f_row && node.j===f_col) ){
                node_dom.css('background-color','lightgrey');
            }
            else
                node_dom.css('background-color','#8ddba1');

            if(path)
                curr=findVertex(vertices,path.i,path.j);
            else
                curr=null;
        }
    }

    window.sp=function(flag){
        if(hasCalledSP)
            return;

        var vertices=generateNodeVertex(col,row);
        var destination={i:num_row-1,j:num_col-1};
        var curr_vertex=null;
        var neighboors=null;
        var cost=0;
        flag=flag===undefined?true:flag;

        curr_vertex=getCheapestVertex(vertices);
        do{
            curr_vertex.known=true;
            neighboors=getNeighboors(curr_vertex,vertices);
            cost=curr_vertex.cost;

            for(var i=0;i<neighboors.length;i++){
                var neighboor=neighboors[i];
                if(neighboor.cost>cost+1){
                    neighboor.cost=cost+1;
                    neighboor.path={i:curr_vertex.i,j:curr_vertex.j};
                }
            }
            curr_vertex=getCheapestVertex(vertices);

        }while(curr_vertex!==null);

        var destination_vertex=findVertex(vertices,destination.i,destination.j);
        if(flag)
            startMakeSPWithAnimation(destination_vertex,vertices);
        else
            startMakeSP(destination_vertex,vertices);
        hasCalledSP=true
    }

    var makeGame=function(){
        hasCalledSP=false;
        initNodes();
        generateMaze()
        putCharacters();
        console.log({nodes});
    }

    makeGame();


    document.onkeyup=onKeyUp

    $btnGenerate.on('click', function(){
        window.sp();
        $(this).css('display', 'none');
    })
    

})();