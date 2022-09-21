/*
  +----------------------+
  | You:                 |
  |   lvl:               |
  |   score: XXX XXX XXX |
  |   lines:             |
  | Opponent:            |
  |   lvl:               |
  |   score: XXX XXX XXX |
  |   lines:             |
  +----------------------+
*/

class Statistics
{
  border;
  monospacedFont;
  fontSize;
  color;
  
  constructor(monospacedFont, fontSize = 14, borderWidth = 3, color = 0xffffff, records = 2)
  {
    this.monospacedFont = monospacedFont;
    this.fontSize = fontSize;
    this.color = color;
    
    const string = this.getStatisticsString();
    const text = new PIXI.Text('\n' + string.repeat(records), {fontFamily: monospacedFont, fontSize: fontSize, fill: color, align: 'left'});
    
    this.border = new PIXI.Graphics();
    this.border.lineStyle(borderWidth, color, 1);
    this.border.beginFill(0xffffff, 0);
    this.border.drawRect(0, 0, text.width, text.height);
  }
  
  /*
    num  - int
    len  - int
    fill - char
    
    13579 -> 000 013 579
  */
  getFormattedScore(num = 0, len = 9, fill = '0')
  {
    const str = String(num).padStart(len, fill);
    return str.replace(/\B(?=(\w{3})+(?!\w))/g, ' ');
  }

  /*
    level - int
    score - int
    lines - int
    title - string ('You' || 'Opponent')
    sp (spaces) - string
  */
  getStatisticsString(level = 0, score = 0, lines = 0, title = 'You', sp = '  ')
  {
    return `${sp}${title}:\n${sp}${sp}level: ${level}\n${sp}${sp}score: ${this.getFormattedScore(score)}${sp}\n${sp}${sp}lines: ${lines}\n`;
  }

  /*
    stats = [{level, score, lines}]
  */
  getStatistics(stats = [])
  {
    const first = stats.shift();
    if (!first)
      return;
    
    let string = this.getStatisticsString(first.level, first.score, first.lines);
    stats.forEach(stat => {
      string += this.getStatisticsString(stat.level, stat.score, stat.lines, 'Opponent');
    });
    stats.unshift(first);
    
    const container = new PIXI.Container();
    const text = new PIXI.Text('\n' + string, {fontFamily: this.monospacedFont, fontSize: this.fontSize, fill: this.color, align: 'left'});
    
    // console.log('getStatistics:', text);
    
    container.addChild(text);
    container.addChild(this.border);
    
    return container;
  }
}

export { Statistics };